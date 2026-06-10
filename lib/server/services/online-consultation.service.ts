// @ts-nocheck
import { HttpError } from "@/lib/server/http-error";
import { Between, In, Not, IsNull } from "typeorm";
import * as dayjs from "dayjs";
import { CreateOnlineConsultationDto } from "@/lib/server/dto/create-online-consultation.dto";
import { OnlineConsultation } from "@/lib/server/entities";
import type { AppointmentsService } from "@/lib/server/services/appointments.service";
import { CreateAppointmentDto } from "@/lib/server/dto/create-appointment.dto";
import { DoctorListingRepository } from "@/lib/server/repositories/doctor-listing.repository";
import { DoctorAvailabilityService } from "@/lib/server/services/doctor-availability.service";
import { AppointmentStatus } from "@/lib/server/enums/appointment-status.enum";
import { AppointmentSubStatus } from "@/lib/server/enums/appointment-sub-status.enum";
import { NoopWhatsappService, NoopEventEmitter } from "@/lib/server/stubs/noop";
import { AppointmentRepository } from "@/lib/server/repositories/appointment.repository";
import { OnlineConsultationRepository } from "@/lib/server/repositories/online-consultation.repository";
import { selectFields } from "@/lib/server/utils/select-fields";
import { Program } from "@/lib/server/enums/program.enum";
import { AppType, PushNotificationType } from "@/lib/server/enums";
import { PaymentStatus } from "@/lib/server/enums/payment-status.enum";
import { DoctorsService } from "@/lib/server/services/doctors.service";
import { CommunicationsService } from "@/lib/server/services/communications.service";
import { PromoCodeService } from "@/lib/server/services/promo-code.service";

export class OnlineConsultationService {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly onlineConsultationRepository: OnlineConsultationRepository,
    private readonly doctorListingRepository: DoctorListingRepository,
    private readonly doctorAvailabilityService: DoctorAvailabilityService,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly whatsappService: NoopWhatsappService,
    private readonly doctorsService: DoctorsService,
    private readonly communicationsService: CommunicationsService,
    private readonly eventEmitter: NoopEventEmitter,
    private readonly promoCodeService: PromoCodeService,
  ) {}

    async create(dto: CreateOnlineConsultationDto, user: any) {
        const userId = dto.userId;

        if (!userId) {
            throw new HttpError(400, 'Invalid User');
        }

        const doctorId = dto.doctorId;

        // 1. Validate Doctor & Hospital Type 2 (Online)
        const doctorListing = await this.doctorListingRepository.findOne({
            where: {
                doctorId: doctorId,
                hospitalType: 2, // Video Consultation
                activeAt: Not(IsNull()),
                inactiveAt: IsNull(),
                deletedAt: IsNull(),
            }
        });

        const doctor = await this.doctorsService.findOne(doctorId);

        if (!doctorListing) {
            throw new HttpError(400, 'Video consultation not allowed for this doctor.');
        }

        // Validate and apply promo code if provided
        let validPromoCode = null;
        if (dto.promoCode) {
            const promoValidation = await this.promoCodeService.validatePromoCode({
                promoCode: dto.promoCode,
                programId: Program.ONLINE_CONSULTATION,
                doctorId: doctorId,
                specialityId: doctorListing.specialityId,
            });

            if (!promoValidation.valid) {
                throw new HttpError(promoValidation.message || 'Invalid promo code');
            }

            validPromoCode = promoValidation.promoCode;
        }

        const createAppointmentDto = new CreateAppointmentDto();
        createAppointmentDto.doctorId = doctorId;
        createAppointmentDto.doctorHospitalId = doctorListing.id;
        createAppointmentDto.hospitalId = doctorListing.hospitalId;
        createAppointmentDto.date = dayjs(dto.date).format('YYYY-MM-DD');
        createAppointmentDto.time = dayjs(dto.date + ' ' + dto.time).format('HH:mm');
        // createAppointmentDto.patientName = dto.patientName;
        // createAppointmentDto.patientPhone = dto.patientPhone;
        createAppointmentDto.userId = userId;
        createAppointmentDto.addedBy = user.id;
        // createAppointmentDto.isCallMyDoctor = false; // TODO: Implement if needed
        createAppointmentDto.deviceType = dto?.deviceType;
        createAppointmentDto.appType = dto?.appType;
        createAppointmentDto.patientCity = dto?.city;
        createAppointmentDto.patientArea = dto?.area;
        createAppointmentDto.utmSource = 'marham-one';
        createAppointmentDto.utmMedium = dto?.utmMedium;
        createAppointmentDto.utmCampaign = dto?.utmCampaign;
        createAppointmentDto.promoCode = validPromoCode?.code;

        const appointment = await this.appointmentsService.create(createAppointmentDto, true, user);

        if (!appointment) {
            throw new HttpError(400, 'Failed to create appointment.');
        }

        // Check if OnlineConsultation entry already exists for this appointment
        const existingOc = await this.onlineConsultationRepository.findOne({
            where: { appointmentId: appointment.id }
        });

        if (existingOc) {
            const appointmentResponse = await this.appointmentsService.createResponseDto(appointment);
            return {
                ...appointmentResponse,
                onlineConsultationId: existingOc.id,
                programId: Program.ONLINE_CONSULTATION,
            };
        }

        const onlineConsultation = new OnlineConsultation();
        onlineConsultation.appointmentId = appointment.id;
        onlineConsultation.userId = appointment.userId;
        onlineConsultation.doctorId = appointment.doctorId;
        onlineConsultation.patientId = appointment.patientId;
        onlineConsultation.patientName = appointment.patientName;
        onlineConsultation.patientPhone = appointment.patientPhone;
        onlineConsultation.doctorName = appointment.doctorName;
        onlineConsultation.doctorPhone = appointment.doctorPhone;
        onlineConsultation.doctorEmail = doctor?.email;
        onlineConsultation.appointmentDate = appointment.date;
        onlineConsultation.appointmentTime = appointment.time;
        onlineConsultation.fee = appointment.fee;
        onlineConsultation.appointmentStatus = appointment.appointmentStatus;
        onlineConsultation.appointmentSubStatus = appointment.appointmentSubStatus;
        onlineConsultation.requestedSpecialityId = appointment.specialityId;
        onlineConsultation.programId = Program.ONLINE_CONSULTATION;
        onlineConsultation.isReferred = appointment.isReferred;
        onlineConsultation.isPromotional = appointment.isPromotional;
        onlineConsultation.promotionalFor = appointment.promotionalFor;
        onlineConsultation.referredBy = appointment.referredBy;
        onlineConsultation.referredTo = appointment.referredTo;
        onlineConsultation.referredSpecialityId = appointment.referredSpecialityId;
        onlineConsultation.uuid = appointment.uuid;
        onlineConsultation.visitorSource = appointment.visitorSource;
        onlineConsultation.utmSource = appointment.utmSource;
        onlineConsultation.utmMedium = appointment.utmMedium;
        onlineConsultation.utmCampaign = appointment.utmCampaign;
        onlineConsultation.addedBy = appointment.addedBy;
        onlineConsultation.leadSourceId = appointment.leadSourceId;
        onlineConsultation.isCallMyDoctor = appointment.isCallMyDoctor;
        onlineConsultation.isRocheAppointment = appointment.isRocheAppointment;
        onlineConsultation.isFree = appointment.isFree;
        onlineConsultation.deviceType = appointment.deviceType;
        onlineConsultation.appType = appointment.appType;
        // onlineConsultation.ipAddress = appointment.ipAddress;
        onlineConsultation.promoCode = validPromoCode?.code || null;

        const savedOc = await this.onlineConsultationRepository.save(onlineConsultation);

        this.communicationsService.sendOnlineConsultationCommunication({
          id: savedOc.id,
          isConsultationUpdated: 1,
          toPatient: 1,
        });

        // Below Event now moved to Subscriber
        // // Send Notification via Event
        // this.eventEmitter.emit(
        //     'online-consultation.booked',
        //     new OnlineConsultationBookedEvent(savedOc.id)
        // );

        const appointmentResponse = await this.appointmentsService.createResponseDto(appointment);
        return {
            ...appointmentResponse,
            onlineConsultationId: savedOc.id,
            programId: Program.ONLINE_CONSULTATION,
        };
    }

    private async checkDuplicateAppointment(phone: string, userId: number, doctorId: number) {
        const whereConditions: any[] = [
            { patientPhone: phone, dId: doctorId, appointmentStatus: AppointmentStatus.IN_PROCESS, appointmentType: 2 },
        ];
        if (userId > 0) {
            whereConditions.push({ userId: userId, dId: doctorId, appointmentStatus: AppointmentStatus.IN_PROCESS, appointmentType: 2 });
        }

        const count = await this.appointmentRepository.count({
            where: whereConditions
        });

        if (count >= 2) {
            throw new HttpError(400, 'You already have in-process appointments with this doctor.');
        }
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

        const targetTime = dayjs(dateStr + ' ' + timeStr).format('h:mm A');
        const targetTime24 = dayjs(dateStr + ' ' + timeStr).format('HH:mm');

        const found = dailySlots.some(s => (s.time === targetTime || s.time === targetTime24) && s.available);

        if (!found) {
            throw new HttpError(400, 'Selected time slot is not available.');
        }

        return found;
    }

    private async isFollowUpPatient(phone: string, doctorId: number): Promise<boolean> {
        const startDate = dayjs().subtract(60, 'days').toDate();
        const endDate = dayjs().toDate();

        const count = await this.appointmentRepository.count({
            where: {
                patientPhone: phone,
                doctorId: doctorId,
                appointmentStatus: In([AppointmentStatus.SCHEDULED, AppointmentStatus.SHOWED_UP]),
                date: Between(startDate, endDate)
            }
        });
        return count > 0;
    }

    async validateForPayment(id: number, userId: number): Promise<OnlineConsultation> {
        const oc = await this.onlineConsultationRepository.findOne({
            where: [
                { id: id, userId: userId },
                { id: id, addedBy: userId }
            ],
            select: selectFields(['id', 'fee', 'paymentStatus', 'appointmentStatus'])
        });

        if (!oc) {
            throw new HttpError(400, 'Order not found');
        }

        if (oc.appointmentStatus !== AppointmentStatus.IN_PROCESS) {
            throw new HttpError(400, 'Order not found');
        }

        if (oc.paymentStatus === PaymentStatus.PAID || oc.paymentStatus === PaymentStatus.EVIDENCE_RECEIVED) {
            throw new HttpError(400, 'Order already paid/under verification');
        }
        return oc;
    }

    async update(id: number, updateData: Partial<OnlineConsultation>, updatedBy: number, doctorId?: number) {
        const oc = await this.findOneComplete(id);
        if (!oc) {
            throw new HttpError(400, 'Online consultation not found');
        }

        const isUserOwner = oc.userId === updatedBy || oc.addedBy === updatedBy;
        const isDoctorOwner = doctorId && oc.doctorId === doctorId;

        if (!isUserOwner && !isDoctorOwner) {
            throw new HttpError(400, 'You are not authorized to update this consultation');
        }

        // ✅ Store old state before update
        const oldState = { ...oc };

        const updatedOc = await this.onlineConsultationRepository.update(id, updateData);
        // if (updateData.appointmentStatus === AppointmentStatus.SCHEDULED && oc.appointmentStatus !== AppointmentStatus.SCHEDULED) {
        //     this.eventEmitter.emit(
        //         'online-consultation.scheduled',
        //         new OnlineConsultationScheduledEvent(id)
        //     );
        // }
        // if (updateData.appointmentStatus === AppointmentStatus.CANCELLED && oc.appointmentStatus !== AppointmentStatus.CANCELLED) {
        //     this.eventEmitter.emit(
        //         'online-consultation.cancelled',
        //         new OnlineConsultationCancelledEvent(id)
        //     );
        // }
        // ✅ Trigger events after update
        await this.handleOnlineConsultationUpdateEvents(oldState, id, Object.keys(updateData));
        return updatedOc;
    }

    async updateByAppointmentId(appointmentId: bigint, updateData: any, updatedBy: number, doctorId?: number) {
        const existingOc = await this.onlineConsultationRepository.findOne({
            where: { appointmentId: appointmentId }
        });
        if (!existingOc) {
            throw new HttpError(400, 'Online consultation not found');
        }
        // Define how Appointment fields map to OnlineConsultation fields
        const fieldsToUpdate = await this.getAppointmentFieldsToUpdateInConsultation(updateData);

        if (Object.keys(fieldsToUpdate).length > 0) {
            const updatedOc = await this.update(existingOc.id, fieldsToUpdate, updatedBy, doctorId);
            // return updatedOc;
            // if (updatedOc &&
            //     fieldsToUpdate.appointmentStatus === AppointmentStatus.SHOWED_UP &&
            //     existingOc.appointmentStatus !== AppointmentStatus.SHOWED_UP &&
            //     updatedBy == existingOc.userId
            // ) {
            //     // Showedup is called by Patient
            //     // Also fire the signal 1019
            //     // Must remove this logic, once the new builds for Marham One are live
            //     this.communicationsService.sendConsultationSignalNotification({
            //         onlineConsultationId: existingOc.id.toString(),
            //         sendToDoctor: '1',
            //         sendToPatient: '0',
            //         appType: '2',
            //         notificationType: PushNotificationType.OC_PATIENT_ENDED_CALL.toString()
            //     });
            // }
            return updatedOc;
        }
        return false;
    }

    private async getAppointmentFieldsToUpdateInConsultation(updateAppointmentDto: any) {
        // 1. Define the "Exceptions" (different names)
        const manualMapping: Record<string, string> = {
            date: 'appointmentDate',
            time: 'appointmentTime',
            specialityId: 'requestedSpecialityId',
            paymentReceived: 'paymentStatus'
        };

        // 2. Get all valid properties from the OC Entity
        const validOcProps = this.onlineConsultationRepository.metadata.columns.map(
            (col) => col.propertyName
        );

        const ocUpdateData: Record<string, any> = {};

        // Use 'as any' or a specific Record type to allow string indexing
        const data = updateAppointmentDto as Record<string, any>;

        // 3. Process the DTO
        for (const [key, value] of Object.entries(data)) {
            if (value === undefined) continue;

            // Check if this key is one of the "Exceptions"
            if (manualMapping[key]) {
                ocUpdateData[manualMapping[key]] = value;
            }
            // Otherwise, check if the name matches exactly in the OC entity
            else if (validOcProps.includes(key)) {
                ocUpdateData[key] = value;
            }
        }
        return ocUpdateData;
    }

    private formatTime(timeStr: string): string {
        return dayjs('2000-01-01 ' + timeStr).format('HH:mm:00');
    }

    private async sendConsultationMessage(consultation: OnlineConsultation) {
        if (consultation.appointmentStatus === AppointmentStatus.IN_PROCESS) {
            // Placeholder template ID and params
            const templateId = 'consultation_booking_in_process_v1';
            const params = [
                { type: 'text', text: consultation.doctorName },
                { type: 'text', text: String(consultation.fee) }
            ];

            try {
                await this.whatsappService.sendTextMessage(templateId, consultation.patientPhone, params);
            } catch (error) {
                console.error('Failed to send WhatsApp message', error);
            }
        }
    }

    async updateStatusAfterEvidenceUpload(id: number, paymentEvidence: string, paymentMethodId: number, addedBy: number) {
        // payment_status = 3
        // const order = await this.findOne(id);
        const consultation = await this.onlineConsultationRepository.findOne({
            where: { id },
            select: selectFields(['appointmentId'])
        });

        if (consultation) {
            const appointment = await this.appointmentsService.findOne(consultation.appointmentId);
            if (appointment) {
                await this.appointmentsService.updateStatusAfterEvidenceUpload(appointment.id, paymentEvidence, paymentMethodId, addedBy);
                await this.update(id, {
                    appointmentSubStatus: AppointmentSubStatus.VERIFYING_PAYMENT,
                    paymentStatus: PaymentStatus.EVIDENCE_RECEIVED,
                    paymentEvidence: paymentEvidence,
                    paymentMethodId: paymentMethodId
                }, addedBy);
            }
        }
    }

    async updateAfterPayment(id: number, paymentStatus: number, paymentId: number, paymentMethodId: number, updatedBy: number, walletAmount: number, walletAmountDetail: any): Promise<boolean> {
        // Get the associated appointment ID and update it as well
        const consultation = await this.onlineConsultationRepository.findOne({
            where: { id },
            select: selectFields(['appointmentId'])
        });

        if (consultation) {
            const appointment = await this.appointmentsService.findOne(consultation.appointmentId);
            if (appointment) {
                const appointmentStatus = (appointment.isDirectBooking || appointment.isCallMyDoctor) ? AppointmentStatus.SCHEDULED : AppointmentStatus.IN_PROCESS;
                const appointmentSubStatus = (appointment.isDirectBooking || appointment.isCallMyDoctor) ? AppointmentSubStatus.SCHEDULED : AppointmentSubStatus.PAID;
                // Update patient appointment using the service
                await this.appointmentsService.update(appointment.id, {
                    paymentReceived: paymentStatus,
                    paymentId: paymentId,
                    paymentMethodId: paymentMethodId,
                    appointmentStatus: appointmentStatus,
                    appointmentSubStatus: appointmentSubStatus,
                    onlinePayment: false,
                    updatedBy: updatedBy,
                    walletAmount,
                    walletAmountDetail
                }, updatedBy);
                // Update online consultation using the service
                await this.onlineConsultationRepository.update(id, {
                    paymentStatus: paymentStatus,
                    paymentId: paymentId,
                    paymentMethodId: paymentMethodId,
                    appointmentStatus: appointmentStatus,
                    appointmentSubStatus: appointmentSubStatus,
                });

                this.eventEmitter.emit(
                    'online-consultation.payment-done',
                    new OnlineConsultationPaymentDoneEvent(id)
                );
            }
        }
        return true;
    }

    async getAppointmentIdByOrderId(orderId: number): Promise<bigint | undefined> {
        return await this.onlineConsultationRepository.getAppointmentIdByOrderId(orderId);
    }

    // async updateWalletDetailsForPartialPayment(id: number, walletAmount: number, walletAmountDetail: any): Promise<void> {
    //     await this.onlineConsultationRepository.updateWalletDetails(id, walletAmount, walletAmountDetail);
    // }

    async findOneComplete(id: number) {
        return await this.onlineConsultationRepository.findOneComplete(id);
    }

    async updateArrival(onlineConsultationId: number, userId: number, doctorId?: number) {
        const oc = await this.onlineConsultationRepository.findOne({
            where: { id: onlineConsultationId }
        });

        if (!oc) {
            throw new HttpError(400, 'Online consultation not found');
        }

        const isUserOwner = Number(oc.userId) === Number(userId) || Number(oc.addedBy) === Number(userId);
        const isDoctorOwner = doctorId && Number(oc.doctorId) === Number(doctorId);

        if (!isUserOwner && !isDoctorOwner) {
            throw new HttpError(400, 'You are not authorized to update this consultation');
        }

        const updateData: Partial<OnlineConsultation> = {};
        const now = new Date();
        if (isUserOwner && !oc.patientArrivedAt) {
            updateData.patientArrivedAt = now;
        } else if (isDoctorOwner && !oc.doctorArrivedAt) {
            updateData.doctorArrivedAt = now;
        }

        await this.onlineConsultationRepository.updateById(onlineConsultationId, updateData);
        return {
            status: true,
            message: "Arrival updated successfully"
        };
    }

    async updateLastSeen(onlineConsultationId: number, userId: number, doctorId?: number) {
        const oc = await this.onlineConsultationRepository.findOne({
            where: { id: onlineConsultationId }
        });

        if (!oc) {
            throw new HttpError(400, 'Online consultation not found');
        }

        const isUserOwner = Number(oc.userId) === Number(userId) || Number(oc.addedBy) === Number(userId);
        const isDoctorOwner = doctorId && Number(oc.doctorId) === Number(doctorId);

        if (!isUserOwner && !isDoctorOwner) {
            throw new HttpError(400, 'You are not authorized to update this consultation');
        }

        const updateData: Partial<OnlineConsultation> = {};
        const now = new Date();
        if (isDoctorOwner) {
            updateData.doctorLastSeenAt = now;
            updateData.doctorLiveStreamLastSeenAt = now;
        } else if (isUserOwner) {
            updateData.patientLastSeenAt = now;
            updateData.patientLiveStreamLastSeenAt = now;
        }

        await this.onlineConsultationRepository.updateById(onlineConsultationId, updateData);
        return {
            status: true,
            message: "Last seen updated successfullyy"
        };
    }

    // ✅ Helper function with all event logic
    private async handleOnlineConsultationUpdateEvents(oldState: OnlineConsultation, id: number, updatedCols: string[]) {
        // Fetch new state after update
        const newState = await this.findOneComplete(id);
        if (!newState) return;

        // 1. Status Logic
        const wasScheduled = oldState.appointmentStatus === AppointmentStatus.SCHEDULED;
        const isNowScheduled = newState.appointmentStatus === AppointmentStatus.SCHEDULED;
        const isNowCancelled = newState.appointmentStatus === AppointmentStatus.CANCELLED;
        const wasNotCancelled = oldState.appointmentStatus !== AppointmentStatus.CANCELLED;
        // const wasNotPrescribed = oldState.appointmentSubStatus !== AppointmentSubStatus.PRESCRIBED;
        // const isNowPrescribed = newState.appointmentSubStatus === AppointmentSubStatus.PRESCRIBED;
        // const wasNotShowedup = oldState.appointmentStatus !== AppointmentStatus.SHOWED_UP;
        // const isNowShowedup = newState.appointmentStatus === AppointmentStatus.SHOWED_UP;

        // 2. Optimized Change Detection
        const isDoctorChanged = updatedCols.includes('doctorId') && newState.doctorId !== oldState.doctorId;

        const isTimeChanged = updatedCols.includes('time') && newState.appointmentTime !== oldState.appointmentTime;

        const isDateChanged = updatedCols.includes('date') && newState.appointmentDate !== oldState.appointmentDate;

        const isPrescribed = updatedCols.includes('appointmentSubStatus') && (newState.appointmentSubStatus === AppointmentSubStatus.PRESCRIBED);

        // 3. Fire Events
        if (!wasScheduled && isNowScheduled) {
            // Case: Transitioned to Scheduled
            this.eventEmitter.emit('online-consultation.scheduled', new OnlineConsultationScheduledEvent(id));
        }
        else if (wasScheduled && isNowScheduled && (isDoctorChanged || isDateChanged || isTimeChanged)) {
            // Case: Stayed Scheduled but critical details changed
            this.eventEmitter.emit('online-consultation.rescheduled', new OnlineConsultationRescheduledEvent(id));
        }
        else if (wasNotCancelled && isNowCancelled) {
            // Case: Cancelled
            this.eventEmitter.emit('online-consultation.cancelled', new OnlineConsultationCancelledEvent(id));
        }
        else if (isPrescribed) {
            this.eventEmitter.emit('online-consultation.prescribed', new OnlineConsultationPrescribedEvent(id));
        }
        // else if (wasNotShowedup && isNowShowedup) {
        //     // Case: Cancelled
        //     this.eventEmitter.emit('online-consultation.showedup', new OnlineConsultationShowedupEvent(id));
        // }
    }
}

