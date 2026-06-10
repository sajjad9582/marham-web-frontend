// @ts-nocheck
import { HttpError } from "@/lib/server/http-error";
import { PatientAppointment, PromoCode } from "@/lib/server/entities";
import { CreateAppointmentDto } from "@/lib/server/dto/create-appointment.dto";
import { AppointmentResponseDto } from "@/lib/server/dto/appointment-response.dto";
import { DateUtil } from "@/lib/server/utils/date.util";
import { StringUtil } from "@/lib/server/utils/string.util";
import { AppointmentUtil } from "@/lib/server/utils/appointment.util";
import { AppointmentRepository } from "@/lib/server/repositories/appointment.repository";
import { PatientRepository } from "@/lib/server/repositories/patient.repository";
import { DoctorAvailabilityService } from "@/lib/server/services/doctor-availability.service";
import * as dayjs from "dayjs";
import { AppointmentStatus, AppointmentSubStatus, AppType } from "@/lib/server/enums";
import { DoctorsService } from "@/lib/server/services/doctors.service";
import { UsersService } from "@/lib/server/services/users.service";
import { Program } from "@/lib/server/enums";
import { PaymentStatus } from "@/lib/server/enums/payment-status.enum";
import { NoopStorageService, NoopEventEmitter, NoopPatientRecordFileRepository } from "@/lib/server/stubs/noop";
import { DoctorImageUtil } from "@/lib/server/utils/doctor-image.util";
import { getConfig, type ConfigAdapter } from "@/lib/server/config";
import { AppointmentType } from "@/lib/server/enums/appointment-type.enum";
import { CorporateService } from "@/lib/server/services/corporate.service";
import { ReferralOptions } from "@/lib/server/interfaces/referral-values.interface";
import { DiscountOptions } from "@/lib/server/dto/discount-options.dto";
import type { OnlineConsultationService } from "@/lib/server/services/online-consultation.service";
import { AppointmentRecordUpload } from "@/lib/server/enums";
import { PromoCodeService } from "@/lib/server/services/promo-code.service";
import { CALL_BUTTON_SHOW_UP_WINDOW_MS } from "@/lib/server/constants/index";

export class AppointmentsService {
  onlineConsultationService!: OnlineConsultationService;

  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientRepository: PatientRepository,
    private readonly patientRecordFileRepository: NoopPatientRecordFileRepository,
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
    private readonly doctorsService: DoctorsService,
    private readonly usersService: UsersService,
    private readonly storageService: NoopStorageService,
    private readonly eventEmitter: NoopEventEmitter,
    private readonly configService: ConfigAdapter = { get: getConfig },
    private readonly corporateService: CorporateService,
    private readonly promoCodeService: PromoCodeService,
  ) {}

    // 1. Overload Signature for `true`: Guarantees a PatientAppointment entity
    create(createAppointmentDto: CreateAppointmentDto, wantFullObject: true, user: any): Promise<PatientAppointment>;

    // 2. Overload Signature for `false`: Guarantees a DTO
    create(createAppointmentDto: CreateAppointmentDto, wantFullObject: false, user: any): Promise<AppointmentResponseDto>;

    // 3. The actual implementation signature (uses union types internally)
    async create(createAppointmentDto: CreateAppointmentDto, wantFullObject: boolean, user: any): Promise<PatientAppointment | AppointmentResponseDto> {
        // 1. Fetch Doctor Listing
        if (!createAppointmentDto.doctorHospitalId) {
            throw new HttpError(400, 'Doctor Hospital ID is required');
        }

        const listing = await this.doctorsService.findListingById(createAppointmentDto.doctorHospitalId);

        const doctor = await this.doctorsService.findOne(createAppointmentDto.doctorId);

        const userId = createAppointmentDto.userId;

        if (!listing || !doctor) {
            throw new HttpError(400, 'Doctor not found');
        }

        // Validate that userId belongs to authenticated user or their family member
        await this.usersService.validateUserAccess(user.id, userId);

        // Get the target user's phone for duplicate check
        const targetUser = await this.usersService.findOne(userId);
        if (!targetUser || !targetUser.phone) {
            throw new HttpError(400, 'User not found or phone number missing');
        }

        const doctorId = listing.doctorId;
        const hospitalId = listing.hospitalId;

        // 2. Validate Slot Availability
        await this.validateSlotAvailability(doctorId, hospitalId, createAppointmentDto.date, createAppointmentDto.time);

        // 3. Add check, if the patient has more than 2 in-process bookings with the same doctor, on same appointmentDate, don't allow the 3rd booking
        await this.validateDuplicateProcessAppointments(targetUser.phone, doctorId, createAppointmentDto.date);

        let corporateUser = null;
        if (userId) {
            corporateUser = await this.corporateService.getCorporateUserDetails(userId);
        }

        const userType = createAppointmentDto.appointmentUserType || (createAppointmentDto.userId ? 1 : 4);

        const isFollowUp = await this.isFollowUpPatient(targetUser.phone, doctorId);
        const { id: appointmentId, flApptId } = await this.generateAppointmentId(
            hospitalId,
            userType
        );

        // Validate and apply promo code if provided
        let validPromoCode = null;
        let promoCodeId = null;
        if (createAppointmentDto.promoCode) {
            const promoValidation = await this.promoCodeService.validatePromoCode({
                promoCode: createAppointmentDto.promoCode,
                programId: Program.PHYSICAL_APPOINTMENT,
                doctorId: doctorId,
                specialityId: listing.specialityId,
            });

            if (!promoValidation.valid) {
                throw new HttpError(promoValidation.message || 'Invalid promo code');
            }

            validPromoCode = promoValidation.promoCode;
            promoCodeId = validPromoCode ? BigInt(validPromoCode.id) : null;
        }

        const referralValues = await this.getReferralValues({
            fee: listing.fee,
            discountFee: listing.discountFee,
            consultancyReferral: listing.consultancyReferral,
            isFree: false,  // isFree
            promoCode: validPromoCode,  // promoCode
            appointmentType: listing.hospitalType,
            isPersonalAppointment: false,// isPersonalAppointment: boolean,
            isFollowUp,
            isOnlinePaymentEnabled: listing.isOnlinePaymentEnabled,
            isCorporateUser: (corporateUser !== null),
            corporateAppointmentDiscount: corporateUser?.appointmentDiscountPercentage,
            corporateConsultationDiscount: corporateUser?.videoConsultationDiscountPercentage
        });
        // Find or create patient record
        const patient = await this.patientRepository.findOrCreatePatient({
            name: targetUser.name,
            phone: targetUser.phone,
            userId: targetUser.id,
            age: createAppointmentDto.patientAge,
            city: createAppointmentDto.patientCity,
            area: createAppointmentDto.patientArea,
            uuid: createAppointmentDto.uuid,
            visitorSource: createAppointmentDto.visitorSource,
            utmSource: createAppointmentDto.utmSource,
            utmMedium: createAppointmentDto.utmMedium,
            utmCampaign: createAppointmentDto.utmCampaign
        });

        const patientId = patient.id;

        // 4. Populate DTO with Listing Data
        // Exclude promoCode string from the spread
        const { promoCode: _promoCode, ...createAppointmentData } = createAppointmentDto;

        // Map data from listing
        const savedAppointment = await this.appointmentRepository.createAppointment({
            ...createAppointmentData,
            id: appointmentId,

            date: dayjs(createAppointmentDto.date).format('YYYY-MM-DD') as any,
            time: dayjs(createAppointmentDto.date + ' ' + createAppointmentDto.time).format('HH:mm:ss'),

            doctorHospitalId: listing.id,
            specialityId: listing.specialityId,
            doctorId: doctor.id,
            doctorName: listing.doctorName,
            doctorPhone: doctor.phone,
            hospitalId: hospitalId,
            fee: referralValues.fee,
            promoCodeId: promoCodeId ? String(promoCodeId) : null,

            patientId: patientId,
            patientPhone: targetUser.phone,
            patientName: targetUser.name,
            patientAge: patient.age || 0,
            patientCity: patient.city || createAppointmentDto.patientCity,
            patientArea: patient.area || createAppointmentDto.patientArea,

            hospitalName: listing.hospitalName,
            appointmentType: listing.hospitalType || 1,
            accessToken: StringUtil.generateAccessToken(16),
            flApptId: flApptId,

            doctorFee: listing.fee,

            referralAmount: referralValues.referralAmount,
            doctorReferralAmount: referralValues.doctorReferralAmount,
            discount: referralValues.discount,
            discountPercentage: referralValues.discountPercentage,
            consultancyReferral: referralValues.consultancyReferral,
            isFree: referralValues.isFree,

            // Ensure status defaults if not provided
            appointmentStatus: (listing.hospitalType == 1 && listing.directBooking) ? AppointmentStatus.SCHEDULED : AppointmentStatus.IN_PROCESS,
            appointmentSubStatus: (listing.hospitalType == 1 && listing.directBooking) ? AppointmentSubStatus.SCHEDULED : AppointmentSubStatus.IN_PROCESS,

            day: new Date(createAppointmentDto.date).getUTCDate(),
            month: new Date(createAppointmentDto.date).getUTCMonth() + 1,
            year: new Date(createAppointmentDto.date).getUTCFullYear(),

            addedBy: createAppointmentDto.addedBy || user.id,
            updatedBy: createAppointmentDto.updatedBy || user.id,
            paymentTimestamps: this.getDefaultPaymentTimestamps(),
            contractType: listing.contractType,
            ocContractedHospitalId: listing.ocContractedHospitalId,
            isDirectBooking: listing.directBooking,

            followUp: isFollowUp,

            utmSource: 'marham-one',

            // Fix Date type mismatch from DTO strings
            reviewedAt: undefined,
            evidencePaymentDate: undefined,
            scheduledAt: undefined,
            cancelledAssignAt: undefined,
            cancelledAt: undefined,
            harmonyAssignAt: undefined,
            showedupAt: undefined,
            createdDate: undefined,

            // appType: 5
        });

        let richAppointment;
        if (wantFullObject) {
            richAppointment = await this.appointmentRepository.findOneComplete(savedAppointment.id);
        } else {
            richAppointment = await this.appointmentRepository.findOneDetailed(savedAppointment.id);
        }

        if (!richAppointment) {
            throw new HttpError(400, 'Appointment not found after creation');
        }

        // Mark promo code as used if it was a one-time code
        if (validPromoCode) {
            await this.promoCodeService.markPromoCodeAsUsed(validPromoCode.id);
        }

        // Below events are moved to Susbcriber

        // if (richAppointment.appointmentType == AppointmentType.PHYSICAL) {
        //     // Emit Event only for Physical Appointments
        //     // For Online Consultations, event will be emitted from online-consultation.service
        //     if (richAppointment.appointmentStatus == AppointmentStatus.IN_PROCESS) {
        //         this.eventEmitter.emit('appointment.booked', new AppointmentBookedEvent(savedAppointment.id));
        //     } else if (richAppointment.appointmentStatus == AppointmentStatus.SCHEDULED) {
        //         this.eventEmitter.emit('appointment.scheduled', new AppointmentScheduledEvent(savedAppointment.id));
        //     }
        // }

        if (wantFullObject) {
            return richAppointment;
        }

        const appointmentData = this.createResponseDto(richAppointment);

        return {
            ...appointmentData
        };
    }

    private async validateSlotAvailability(doctorId: number, hospitalId: number, dateStr: string, timeStr: string) {
        const formattedDate = dayjs(dateStr).format('YYYY-MM-DD');

        const availability = await this.doctorAvailabilityService.getDoctorAvailableSlots(
            doctorId,
            hospitalId,
            formattedDate,
            1 // days count
        );

        if (!availability.availableSlots || availability.availableSlots.length === 0) {
            throw new HttpError(400, 'No available slots found for this date.');
        }

        const dailySlots = availability.availableSlots[0]?.slots || [];

        const targetTime = dayjs(dateStr + ' ' + timeStr).format('hh:mm A');
        const targetTime24 = dayjs(dateStr + ' ' + timeStr).format('HH:mm');

        const found = dailySlots.some(s => (s.time === targetTime || s.time === targetTime24) && s.available);

        if (!found) {
            throw new HttpError(400, 'Selected time slot is not available.');
        }
    }

    private async findExistingDuplicateAppointment(userId: number, doctorId: number): Promise<PatientAppointment | null> {
        return this.appointmentRepository.findLatestInProcessAppointment(userId, doctorId);
    }

    async isFollowUpPatient(phone: string, doctorId: number): Promise<boolean> {
        const startDate = dayjs().subtract(60, 'days').toDate();
        const endDate = dayjs().toDate();

        return this.appointmentRepository.isFollowUpPatient(phone, doctorId, startDate, endDate);
    }

    /**
     * Generate appointment ID in format: [appointmentType][hospitalId][sequentialId]
     * - appointmentType: 1 digit (1=logged in, 4=not logged in, 2=created by doctor)
     * - hospitalId: 5 digits (zero-padded)
     * - sequentialId: variable length (NOT zero-padded, can exceed 6 digits)
     */
    async generateAppointmentId(hospitalId: number, appointmentUserType: number): Promise<{ id: bigint; flApptId: number }> {
        const lastFlApptId = await this.appointmentRepository.getLastFlApptId(hospitalId);

        const nextFlApptId = lastFlApptId ? lastFlApptId + 1 : 1;

        // Format: [1 digit appointmentType][5 digit hospitalId][sequential - NO padding]
        const appointmentTypeStr = appointmentUserType.toString();
        const hospitalIdStr = hospitalId.toString().padStart(5, '0');
        const sequentialIdStr = nextFlApptId.toString();

        const id = BigInt(appointmentTypeStr + hospitalIdStr + sequentialIdStr);

        return { id, flApptId: nextFlApptId };
    }

    async validateForPayment(id: bigint, userId: number): Promise<PatientAppointment> {
        const appointment = await this.appointmentRepository.findForPaymentValidation(id, userId);

        if (!appointment) {
            throw new HttpError(400, 'Order not found');
        }

        if ((appointment.appointmentStatus !== AppointmentStatus.IN_PROCESS) && (appointment.appointmentStatus !== AppointmentStatus.SCHEDULED)) {
            throw new HttpError(400, 'Order not found');
        }

        if (appointment.paymentReceived === 1) { // 1 = PAID
            throw new HttpError(400, 'Order already paid');
        }
        return appointment;
    }

    async validateAppointmentOwnership(appointmentId: bigint, userId: number, doctorId?: number): Promise<PatientAppointment> {
        const appointment = await this.findOne(appointmentId);
        if (!appointment) {
            throw new HttpError(400, 'Appointment not found');
        }

        const isUserOwner = appointment.userId === userId || appointment.addedBy === userId;
        const isDoctorOwner = doctorId && appointment.doctorId === doctorId;

        if (!isUserOwner && !isDoctorOwner) {
            throw new HttpError(400, 'Appointment does not belong to the user or doctor');
        }

        return appointment;
    }

    async validateDuplicateProcessAppointments(phone: string, doctorId: number, date: string) {
        const hasInProcessAppointments = await this.appointmentRepository.hasDuplicateProcessAppointment(phone, doctorId, date);
        if (hasInProcessAppointments) {
            throw new HttpError(400, 'You have 2 in-process bookings with this doctor on the same date. To book more appointment, please call on our helpline number 042-32591427.');
        }
    }

    async findOne(id: bigint) {
        return this.appointmentRepository.findOneDetailed(id);
    }

    async findOneComplete(id: bigint) {
        return this.appointmentRepository.findOneComplete(id);
    }

    async update(id: bigint, updateAppointmentDto: UpdateAppointmentDto, userId: number, doctorId?: number) {
        await this.validateAppointmentOwnership(id, userId, doctorId);
        const appointment = await this.findOneComplete(id);
        if (!appointment) {
            throw new HttpError(400, 'Appointment not found');
        }
        const oldState = { ...appointment };

        if (updateAppointmentDto.time) {
            const appointmentDate = dayjs(appointment.date).format('YYYY-MM-DD');
            updateAppointmentDto.time = dayjs(appointmentDate + ' ' + updateAppointmentDto.time).format('HH:mm:ss');
        }

        updateAppointmentDto.updatedBy = userId;

        if (updateAppointmentDto.appointmentSubStatus === AppointmentSubStatus.PRESCRIBED) {
            updateAppointmentDto.prescriptionAdded = 1;
            updateAppointmentDto.prescriptionAddedFrom = AppType.CONNECT;
        }

        await this.appointmentRepository.update(id.toString(), updateAppointmentDto);

        if (appointment.appointmentType === AppointmentType.PHYSICAL) {
            // Below events are now moved to AppointmentSubscriber
            await this.handleAppointmentUpdateEvents(oldState, id, Object.keys(updateAppointmentDto));
        } else if (appointment.appointmentType === AppointmentType.ONLINE) {
            await this.onlineConsultationService.updateByAppointmentId(id, updateAppointmentDto, userId, doctorId);
        }

        return {
            'status': true,
            'message': 'Appointment updated successfully',
        }
    }

    async getUserAppointments(userId: number, query: GetUserAppointmentsDto): Promise<UserAppointmentsResponseDto> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const now = DateUtil.now();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];

        // Fetch all appointments for the user
        const [appointments, total] = await this.appointmentRepository.findUserAppointments({
            userId,
            skip,
            limit: 10000
        });

        // Separate upcoming and previous appointments
        const upcoming: AppointmentResponseDto[] = [];
        const previous: AppointmentResponseDto[] = [];

        appointments.forEach((appointment: PatientAppointment) => {

            const appointmentData = this.createResponseDto(appointment);

            // Check if appointment is upcoming or previous
            const appointmentDate = appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : null;

            if (appointmentDate) {
                if (appointmentDate > currentDate) {
                    upcoming.push(appointmentData);
                } else if (appointmentDate === currentDate) {
                    // For today's appointments, show in upcoming if within 2 hours after scheduled time
                    const appointmentTime = dayjs(appointment.date + ' ' + appointment.time);
                    const appointmentEndTime = appointmentTime.add(2, 'hours');
                    const now = dayjs();
                    
                    if (now.isBefore(appointmentEndTime)) {
                        upcoming.push(appointmentData);
                    } else {
                        previous.push(appointmentData);
                    }
                } else {
                    previous.push(appointmentData);
                }
            } else {
                // If no date, consider it previous
                previous.push(appointmentData);
            }
        });

        // AppointmentUtil.sortByDateTimeAsc(upcoming);

        return {
            upcoming,
            previous,
            meta: {
                upcomingCount: upcoming.length,
                previousCount: previous.length,
                page,
                limit,
            },
        };
    }

    async getUserUpcomingAppointmentsCount(userId: number) {
        const now = DateUtil.now();
        
        // Set the time to 30 mins back, so the consultation will still show after 30 mins
        now.setMinutes(now.getMinutes() - 30);
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];

        // Fetch all appointments for the user
        return await this.appointmentRepository.getUpcomingAppointmentsCount(userId, currentDate, currentTime);
    }

    async getUserUpcomingAppointment(userId: number) {
        const now = DateUtil.now();

        // Set the time to 30 mins back, so the consultation will still show after 30 mins
        now.setMinutes(now.getMinutes() - 30);
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];

        // Fetch all appointments for the user
        const appointments = await this.appointmentRepository.getUpcomingAppointments(userId, currentDate, currentTime, 1, [AppointmentStatus.SCHEDULED]);
        if (appointments.length === 0) {
            return null;
        }
        return this.createResponseDto(appointments[0]);
    }

    async getReferralValues(options: ReferralOptions) {

        this.logger.log(`options values got`, options);

        const discountOptions: DiscountOptions = {
            fee: options.fee,
            discountFee: options.discountFee,
            hospitalType: options.appointmentType,
            isOnlinePaymentEnabled: options.isOnlinePaymentEnabled,
            isCorporateUser: (options.isCorporateUser == true),
            corporateAppointmentDiscount: options.corporateAppointmentDiscount,
            corporateConsultationDiscount: options.corporateConsultationDiscount,
            promoCode: options.promoCode
        };

        // finalDiscountFee is the fee after discount
        let { finalDiscountFee, discountPercentage, discountType, isDiscountApplied } = await this.doctorsService.calculateDiscount(discountOptions);

        let discount = options.fee - finalDiscountFee;
        const result: any = {
            doctorFee: options.fee,
            fee: options.fee,
            referralAmount: 0,
            doctorReferralAmount: 0,
            discount: 0,
            discountPercentage: 0,
            consultancyReferral: options.consultancyReferral,
            isFree: options.isFree ? 1 : 0
        };

        if (options.isFree) {
            result.fee = 0;
            result.discountedAmount = 0;
            return result;
        }

        // Promo code discount overrides all other discounts and is handled in calculateDiscount
        if (options.promoCode && discountType == 'promo_code') {
            result.fee = finalDiscountFee;
            result.discount = discount;
            result.discountPercentage = discountPercentage;
            result.referralAmount = finalDiscountFee * (options.consultancyReferral * 0.01);
            result.doctorReferralAmount = finalDiscountFee * (100 - options.consultancyReferral) * 0.01;
            return result;
        }

        if (options.appointmentType === AppointmentType.PHYSICAL && options.isFollowUp) {
            result.referralAmount = 0;
            result.doctorReferralAmount = options.fee;
        } else if (options.isPersonalAppointment) {
            result.consultancyReferral = 15;
            result.referralAmount = options.fee * result.consultancyReferral * 0.01;
            result.doctorReferralAmount = options.fee * (100 - result.consultancyReferral) * 0.01;
        } else {
            if (discountType == 'doctor_discount') {
                // If discount given by the doctor
                result.referralAmount = options.discountFee * (options.consultancyReferral * 0.01);
                result.doctorReferralAmount = options.discountFee * (100 - options.consultancyReferral * 0.01);
            } else {
                // If Discount offered by Marham on it's own share
                // marham_discount, corporate_discount, online_discount
                if (discountType == 'online_discount') {
                    // Do Nothing, as we arn't saving the online payment discount upon booking
                    // We are giving it on payment
                    // That will be handled in the payment service
                    isDiscountApplied = false;
                } else {
                    result.referralAmount = (options.fee * (options.consultancyReferral - discountPercentage) * 0.01)
                    result.doctorReferralAmount = options.fee * (100 - options.consultancyReferral) * 0.01;
                }
            }
        }

        if (isDiscountApplied) {
            result.discount = discount;
            result.discountPercentage = discountPercentage;
            result.fee = Math.floor(options.fee - result.discount);
        }

        return result;
    }

    /**
     * Check for conflicting appointments in a date range
     */
    async checkConflicts(doctorId: number, hospitalId: number | null, startDate: string, endDate: string) {
        const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
        const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');

        const conflicts = await this.appointmentRepository.findConflictingAppointments(doctorId, hospitalId, formattedStartDate, formattedEndDate);
        return conflicts.map(app => this.createResponseDto(app));
    }

    createResponseDto(appointment: PatientAppointment): AppointmentResponseDto {
        // const { doctor, statusDetail, subStatusDetail, onlineConsultation, ...appointmentData } = appointment;
        // Removing extra values from being sent in response
        const { doctor, hospital, doctorListing, ...appointmentData } = appointment;

        const canShowCallButton = this.shouldShowCallButton(appointment);

        return {
            ...appointmentData,
            date: appointment.date ? DateUtil.formatDate(appointment.date) : '',
            time: appointment.time ? DateUtil.formatTime(appointment.time) : '',
            appointmentStatusTitle: appointment.statusDetail?.title || '',
            appointmentSubStatusTitle: appointment.subStatusDetail?.title || '',
            paymentReceivedStatus: appointment.paymentReceived === 1 ? 'Paid' : 'Unpaid',
            isOnlinePaymentEnabled: Boolean(doctorListing?.isOnlinePaymentEnabled || 0),
            onlineConsultationId: appointment.onlineConsultation?.id ?? 0,
            programId: (appointment.appointmentType == Program.ONLINE_CONSULTATION ? Program.ONLINE_CONSULTATION : Program.PHYSICAL_APPOINTMENT),
            doctorProfilePic: DoctorImageUtil.getDoctorImageUrl(this.configService, doctor?.id, doctor?.profilePic, doctor?.gender || 1),
            isCommutable: Boolean(appointment.isCommutable),
            canShowCallButton: canShowCallButton,
            lat: hospital?.lat ?? 0,
            lng: hospital?.lng ?? 0,
            isLocationVerified: (hospital?.locationVerifiedAt !== null)
        };
    }

    private shouldShowCallButton(appointment: PatientAppointment): boolean {
        if (appointment.appointmentType === AppointmentType.PHYSICAL) {
            return false;
        }
        // Show call button if appointment status is Scheduled
        if (appointment.appointmentStatus === AppointmentStatus.SCHEDULED) {
            return true;
        }

        // Show call button if showedupAt is not more than 2 hours ago
        if (appointment.showedupAt) {
            const now = dayjs();
            const showedupTime = dayjs(appointment.showedupAt);
            const twoHoursInMs = CALL_BUTTON_SHOW_UP_WINDOW_MS;
            const diffInMs = now.diff(showedupTime);
            
            if (diffInMs <= twoHoursInMs) {
                return true;
            }
        }

        return false;
    }

    getDefaultPaymentTimestamps(): any {
        return {
            payment_yes_at: "",
            payment_evidence_received_at: "",
            payment_to_be_refund_marked_at: "",
            payment_refunded_at: ""
        };
    }

    async getAppointmentDetails(appointmentId: bigint, userId: number, doctorId?: number) {
        const appointment = await this.validateAppointmentOwnership(appointmentId, userId, doctorId);
        return {
            ...this.createResponseDto(appointment)
        }
    }

    async updateStatusAfterEvidenceUpload(id: bigint, paymentEvidence: string, paymentMethodId: number, addedBy: number) {
        await this.update(id, {
            appointmentSubStatus: AppointmentSubStatus.VERIFYING_PAYMENT,
            paymentReceived: PaymentStatus.EVIDENCE_RECEIVED,
            paymentEvidence: paymentEvidence,
            paymentMethodId: paymentMethodId,
            updatedBy: addedBy
        }, addedBy);
    }

    async updateAfterPayment(id: bigint, paymentStatus: number, paymentId: number, paymentMethodId: number, updatedBy: number, walletAmount: number, walletAmountDetail: any) {
        const appointment = await this.findOneComplete(id);
        if (appointment) {
            let appointmentStatus = appointment.isDirectBooking ? AppointmentStatus.SCHEDULED : AppointmentStatus.IN_PROCESS;
            let appointmentSubStatus = appointment.isDirectBooking ? AppointmentSubStatus.SCHEDULED : AppointmentSubStatus.PAID;
            
            let fee = appointment.fee;
            const discountPercentage = Number(process.env.MARHAM_PHYSICAL_APPOINTMENT_ONLINE_PAYMENT_DISCOUNT_PERCENTAGE || 10);
            const discount = fee * discountPercentage * 0.01;
            fee = fee - discount;
            const referralAmount = (appointment.referralAmount > 0) ? appointment.referralAmount - discount : appointment.referralAmount;
            
            await this.update(id, {
                paymentReceived: paymentStatus,
                paymentId: paymentId,
                paymentMethodId: paymentMethodId,
                appointmentSubStatus: appointmentSubStatus,
                onlinePayment: (appointment.appointmentType == AppointmentType.PHYSICAL ? true : false),
                updatedBy: updatedBy,
                appointmentStatus,
                fee: fee,
                discount: discount,
                discountPercentage: discountPercentage,
                referralAmount: referralAmount,
                walletAmount,
                walletAmountDetail
            }, updatedBy);

            this.eventEmitter.emit(
                'appointment.payment-done',
                new AppointmentPaymentDoneEvent(id)
            );
        }
    }

    async updateWalletDetailsForPartialPayment(id: bigint, walletAmount: number, walletAmountDetail: any, updatedBy: number): Promise<void> {
        await this.appointmentRepository.updateWalletDetails(id, walletAmount, walletAmountDetail, updatedBy);
    }

    async getPrescription(appointmentId: bigint, userId: number, doctorId?: number): Promise<any> {
        // 1. Verify Appointment Ownership & Fetch with relations
        await this.validateAppointmentOwnership(appointmentId, userId, doctorId);

        const appointment = await this.appointmentRepository.findWithPrescriptionRelations(appointmentId);

        const cdnUrl = process.env.CLOUD_BUCKET_CONNECT_PUBLIC_URL || 'https://staticconnectdev.marham.pk/';

        // Format Medicines
        let treatmentPlan = appointment?.treatmentPlan || ''; // patient_appointment_treatment_plan
        let medicinesText = '';
        if (appointment?.medicineList && appointment.medicineList.length > 0) {
            appointment.medicineList.forEach(m => {
                medicinesText += `${m.medicineTitle} - ${m.time} (Days) - ${m.quantity} - ${m.instructions}\n`;
            });
        }
        medicinesText = medicinesText + "\n" + treatmentPlan;

        // Format Tests
        let testsText = appointment?.tests || ''; // patient_appointment_tests (string col)
        let testsText2 = '';
        if (appointment?.testList && appointment.testList.length > 0) {
            appointment.testList.forEach(t => {
                const labTitle = t.laboratory ? t.laboratory.laboratoryTitle : '';
                testsText2 += `${t.globalTestTitle} (${labTitle})\n`;
            });
        }
        testsText = testsText2 + "\n" + testsText;

        // Format Instructions (Strip tags?)
        const instructions = appointment?.instructions ? appointment.instructions.replace(/<[^>]*>?/gm, '') : '';

        // Format Files
        const files = appointment?.fileList ? appointment.fileList
            // .filter(f => f.uploadedBy === AppointmentRecordUpload.DOCTOR)
            .map(f => ({
                id: f.id,
                url: `${cdnUrl}assets/patient_records/${appointment.id}/${f.attachment}`, // Or use CDN env? PHP used generic path.
                attachment: f.attachment,
                ext: f.ext,
                uploadedBy: f.uploadedBy
            })) : [];

        return {
            status: true,
            message: 'Prescription fetched successfully',
            data: {
                id: appointment?.id,
                prescriptionAdded: appointment?.prescriptionAdded,
                medicines: medicinesText.trim(),
                tests: testsText.trim(),
                instructions: instructions,
                files: files
            }
        };
    }

    async uploadPrescription(
        appointmentId: bigint,
        file: any,
        userId: number,
        doctorIdParam: number, // renamed to avoid shadowing if needed, but the original logic uses doctorId from repo
        appType: number,
        deviceType: number
    ): Promise<any> {
        const appointmentIdBigInt = BigInt(appointmentId);
        // 1. Verify appointment exists and user/doctor has access
        const appointment = await this.validateAppointmentOwnership(appointmentIdBigInt, userId, doctorIdParam);

        // 2. Extract file extension
        const originalName = file.originalname;
        const fileExtension = originalName.substring(originalName.lastIndexOf('.') + 1);

        // 3. Generate random string for filename
        const randomString = StringUtil.generateRandomString(16);
        const nameWithoutExt = randomString;

        // 4. Construct file path: assets/patient_records/{appointmentId}/{random-string}.{fileextension}
        const fileName = `${randomString}.${fileExtension}`;
        const filePath = `assets/patient_records/${appointmentId}/${fileName}`;

        // 5. Upload file to GCP Marham Connect storage
        await this.storageService.uploadFile(file, filePath, process.env.CLOUD_BUCKET_CONNECT || 'staticconnectdev.marham.pk');

        // 6. Save record to patient_appointment_record_images table
        const recordFile = await this.patientRecordFileRepository.createPatientRecordFile({
            patientId: appointment.patientId,
            appointmentId: appointmentIdBigInt,
            doctorId: appointment.doctorId,
            uploadedBy: (appType === AppType.MARHAM ? AppointmentRecordUpload.PATIENT : (appType === AppType.CONNECT ? AppointmentRecordUpload.DOCTOR : 0)),
            ext: fileExtension,
            nameWithoutExt: nameWithoutExt,
            attachment: fileName
        });

        // 7. Return success response
        const cdnUrl = process.env.CLOUD_BUCKET_CONNECT_PUBLIC_URL || 'https://staticconnectdev.marham.pk/';
        const fullUrl = `${cdnUrl}${filePath}`;

        if (appType == AppType.CONNECT) {
            // Prescription added by the doctor
            const oldState = { ...appointment };
            const updateAppointmentDto: UpdateAppointmentDto = {
                appointmentSubStatus: AppointmentSubStatus.PRESCRIBED,
                prescriptionAdded: 1,
                prescriptionAddedFrom: AppType.CONNECT,
                updatedBy: userId
            };
            await this.update(appointmentIdBigInt, updateAppointmentDto, userId, doctorIdParam);

            await this.appointmentRepository.update(appointmentIdBigInt.toString(), updateAppointmentDto);

            if (appointment.appointmentType === AppointmentType.PHYSICAL) {
                // Below events are now moved to AppointmentSubscriber
                await this.handleAppointmentUpdateEvents(oldState, appointmentIdBigInt, Object.keys(updateAppointmentDto));
            } else if (appointment.appointmentType === AppointmentType.ONLINE) {
                await this.onlineConsultationService.updateByAppointmentId(appointmentIdBigInt, updateAppointmentDto, userId, doctorIdParam);
            }
        }

        return {
            status: true,
            message: 'Prescription uploaded successfully'
        };
    }

    async markAsReviewed(appointmentId: bigint): Promise<void> {
        await this.appointmentRepository.update({ id: appointmentId }, { reviewedAt: new Date() });
    }

    // ✅ Private method that calls into the subscriber
    private async handleAppointmentUpdateEvents(
        oldState: PatientAppointment,
        id: bigint,
        updatedCols: string[]
    ) {
        // Fetch new state after update
        const newState = await this.findOneComplete(id);
        if (!newState) {
            return;
        }

        // 1. Status Logic
        const wasInprocess = oldState.appointmentStatus === AppointmentStatus.IN_PROCESS;
        const wasScheduled = oldState.appointmentStatus === AppointmentStatus.SCHEDULED;
        const isNowScheduled = newState.appointmentStatus === AppointmentStatus.SCHEDULED;
        const isNowCancelled = newState.appointmentStatus === AppointmentStatus.CANCELLED;
        const wasNotCancelled = oldState.appointmentStatus !== AppointmentStatus.CANCELLED;
        const wasNotPrescribed = oldState.appointmentSubStatus !== AppointmentSubStatus.PRESCRIBED;
        const isNowPrescribed = newState.appointmentSubStatus === AppointmentSubStatus.PRESCRIBED;

        // 2. Optimized Change Detection
        // Only run comparisons if the column was actually part of the update
        const isDoctorChanged = updatedCols.includes('doctorId') && newState.doctorId !== oldState.doctorId;

        const isTimeChanged = updatedCols.includes('time') && newState.time !== oldState.time;

        const isDateChanged = updatedCols.includes('date') && newState.date !== oldState.date;

        // 3. Fire Events
        if (!wasScheduled && isNowScheduled) {
            // Case: Transitioned to Scheduled
            if (isDateChanged || isTimeChanged) {
                this.logger.log(`Emitting Appointment rescheduled`);
                this.eventEmitter.emit('appointment.rescheduled', new AppointmentRescheduledEvent(id));
            } else {
                this.logger.log(`Emitting Appointment scheduled`);
                this.eventEmitter.emit('appointment.scheduled', new AppointmentScheduledEvent(id));
            }
        }
        else if ((wasInprocess || wasScheduled) && isNowScheduled && (isDoctorChanged || isDateChanged || isTimeChanged)) {
            // Case: Stayed Scheduled but critical details changed
            this.logger.log(`Emitting Appointment rescheduled`);
            this.eventEmitter.emit('appointment.rescheduled', new AppointmentRescheduledEvent(id));
        }
        else if (wasNotCancelled && isNowCancelled) {
            // Case: Cancelled
            this.logger.log(`Emitting Appointment cancelled`);
            this.eventEmitter.emit('appointment.cancelled', new AppointmentCancelledEvent(id));
        }
        else if (wasNotPrescribed && isNowPrescribed) {
            // Case: Prescribed
            this.logger.log(`Emitting Appointment prescribed event`);
            this.eventEmitter.emit('appointment.prescribed', new AppointmentPrescribedEvent(id));
        }
    }

    async countAppointmentsByPromoCode(promoCodeId: bigint): Promise<number> {
        return this.appointmentRepository.countAppointmentsByPromoCode(promoCodeId);
    }

    async markAppointmentAsDoctorNotShowedUp(appointmentId: bigint, userId: number, updatedBy: number): Promise<any> {
        await this.validateAppointmentOwnership(appointmentId, userId);

        const updated = await this.appointmentRepository.markAppointmentAsDoctorNotShowedUp(
            appointmentId,
            userId,
            updatedBy
        );

        if (updated) {
            this.eventEmitter.emit('appointment.doctor-not-showedup', new AppointmentDoctorNotShowedUpEvent(appointmentId));
        }

        return {
            success: true,
            message: 'Appointment marked as patient not showed up successfully'
        };
    }

    async toggleIsCommutable(appointmentId: bigint, userId: number, doctorId: number | undefined, isCommutable: boolean): Promise<any> {
        await this.validateAppointmentOwnership(appointmentId, userId, doctorId);

        const appointment = await this.appointmentRepository.toggleIsCommutable(appointmentId, isCommutable);

        if (!appointment) {
            throw new Error('Failed to update appointment');
        }

        return {
            success: true,
            message: 'Appointment commutable status updated successfully',
            data: {
                id: appointment.id,
                isCommutable: appointment.isCommutable
            }
        };
    }
}
