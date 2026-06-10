// @ts-nocheck
import { HttpError } from "@/lib/server/http-error";
import { Not, IsNull } from "typeorm";
import { getConfig, type ConfigAdapter } from "@/lib/server/config";
import { GetDoctorsDto } from "@/lib/server/dto/get-doctors.dto";
import { GetDoctorReviewsDto } from "@/lib/server/dto/get-doctor-reviews.dto";
import { DoctorRepository } from "@/lib/server/repositories/doctor.repository";
import { DoctorListingRepository } from "@/lib/server/repositories/doctor-listing.repository";
import { DoctorReviewRepository } from "@/lib/server/repositories/doctor-review.repository";
import { DoctorExperienceRepository } from "@/lib/server/repositories/doctor-experience.repository";
import { DoctorQualificationRepository } from "@/lib/server/repositories/doctor-qualification.repository";
import { SymptomSpecialityRepository } from "@/lib/server/repositories/symptom-speciality.repository";
import { HtmlUtil, DateUtil } from "@/lib/server/utils";
import { ReviewMapperUtil } from "@/lib/server/utils/review-mapper.util";
import { UserRecentSearchService, NoopHttpService } from "@/lib/server/stubs/noop";
import { CorporateService } from "@/lib/server/services/corporate.service";
import { HospitalType } from "@/lib/server/enums/hospital-type.enum";
import { DiscountOptions } from "@/lib/server/dto/discount-options.dto";
import { DiscountResultDto } from "@/lib/server/dto/discount-result.dto";
import { DoctorListing } from "@/lib/server/entities";
import { DoctorSearchParams } from "@/lib/server/interfaces/doctor-search-params.interface";
import { DoctorListingResponseDto } from "@/lib/server/dto/doctor-listing-response.dto";
import { DoctorBadgesUtil } from "@/lib/server/utils/doctor-badges.util";
import type { UsersService } from "@/lib/server/services/users.service";

export class DoctorsService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly doctorListingRepository: DoctorListingRepository,
    private readonly doctorReviewRepository: DoctorReviewRepository,
    private readonly doctorExperienceRepository: DoctorExperienceRepository,
    private readonly doctorQualificationRepository: DoctorQualificationRepository,
    private readonly symptomSpecialityRepository: SymptomSpecialityRepository,
    private readonly userRecentSearchService: UserRecentSearchService,
    private readonly httpService: NoopHttpService,
    private readonly configService: ConfigAdapter = { get: getConfig },
    private readonly corporateService: CorporateService,
    private readonly usersService?: UsersService,
  ) {}

    async findDoctorsByIds(ids: number[], limit: number = 10, skip: number = 0) {
        const filters: DoctorSearchParams = {
            ids,
            limit,
            skip
        };
        return this.doctorRepository.findDoctorsWithFilters(filters);
    }

    async findListingById(id: number) {
        return this.doctorListingRepository.findOne({
            where: {
                id,
                activeAt: Not(IsNull()),
                inactiveAt: IsNull(),
                deletedAt: IsNull()
            }
        });
    }

    async getDoctorDetailsByUserIds(userIds: number[]) {
        return this.doctorRepository.getDoctorDetailsByUserIds(userIds);
    }

    create(createDoctorDto: CreateDoctorDto) {
        const doctor = this.doctorRepository.create(createDoctorDto);
        return this.doctorRepository.save(doctor);
    }

    async getDoctorListing(query: GetDoctorsDto, userId?: number, deviceId?: string, isOnPanelOnly?: boolean): Promise<DoctorListingResponseDto> {
        const { specialityId, city, area, page = 1, symptomId, serviceId, diseaseId, minFee, maxFee, gender, isFree, lat, lng, consultationType, sortBy, sortDirection, availableToday, hospitalId } = query;

        // Track recent search
        this.userRecentSearchService.trackRecentSearch(query, userId, deviceId).catch(err => console.error('Error tracking recent search', err));

        const limit = 12;
        const skip = (page - 1) * limit;

        // Determine speciality IDs to search for
        let specialityIds: number[] = [];

        if (symptomId) {
            // Get speciality IDs from symptom
            specialityIds = await this.symptomSpecialityRepository.getSpecialityIdsBySymptom(symptomId);

            // If symptom has no specialities, throw error
            if (specialityIds.length === 0) {
                throw new HttpError(
                    `No specialities found for symptom ID ${symptomId}. This symptom may not be associated with any medical specialities.`
                );
            }
        } else if (specialityId) {
            // Use the provided speciality ID
            specialityIds = [specialityId];
        }

        // Fetch doctors using repository
        const filters: DoctorSearchParams = {
            specialityIds,
            serviceId,
            diseaseId,
            city,
            area,
            minFee,
            maxFee,
            gender,
            isFree,
            lat,
            lng,
            consultationType,
            sortBy,
            sortDirection,
            availableToday,
            limit,
            skip,
            isOnPanelOnly,
            hospitalId
        };
        const [doctors, total] = await this.doctorRepository.findDoctorsWithFilters(filters);

        // Fetch hospitals for each doctor
        const doctorIds = doctors.map(d => d.id);
        let hospitals: any[] = [];

        if (doctorIds.length > 0) {
            hospitals = await this.doctorListingRepository.findHospitalsByDoctors({
                doctorIds
            });
        }

        let corporateUser = null;
        if (userId) {
            corporateUser = await this.corporateService.getCorporateUserDetails(userId);
        }

        // 1. Calculate all discounts in parallel
        const hospitalsWithDiscounts = await Promise.all(
            hospitals.map(async (hospital) => {
                const options: DiscountOptions = {
                    fee: hospital.fee,
                    discountFee: hospital.discountFee,
                    hospitalType: hospital.hospitalType,
                    isOnlinePaymentEnabled: hospital.isOnlinePaymentEnabled,
                    isCorporateUser: (corporateUser !== null),
                    corporateAppointmentDiscount: corporateUser?.appointmentDiscountPercentage,
                    corporateConsultationDiscount: corporateUser?.videoConsultationDiscountPercentage
                };
                const { finalDiscountFee, discountPercentage } = await this.calculateDiscount(options);
                return { ...hospital, finalDiscountFee, discountPercentage };
            })
        );

        const hospitalsByDoctor = hospitalsWithDiscounts.reduce((acc, hospital) => {
            if (!acc[hospital.doctorId]) acc[hospital.doctorId] = [];
            acc[hospital.doctorId].push({
                doctorHospitalId: hospital.id,
                doctorId: hospital.doctorId,
                hospitalId: hospital.hospitalId,
                hospitalName: hospital.hospitalName,
                hospitalType: hospital.hospitalType,
                hospitalArea: hospital.hospitalArea,
                hospitalCity: hospital.hospitalCity,
                fee: hospital.fee,
                isOnlinePaymentEnabled: hospital.isOnlinePaymentEnabled,
                discountFee: (hospital.fee != hospital.finalDiscountFee ? hospital.finalDiscountFee : 0),
                discount: hospital.finalDiscountFee ? (hospital.fee - hospital.finalDiscountFee) : 0,
                discountPercentage: hospital.discountPercentage || 0,
                lat: hospital.hospital.lat,
                lng: hospital.hospital.lng,
                isLocationVerified: hospital.hospital.locationVerifiedAt !== null
            });
            return acc;
        }, {} as Record<number, any[]>);

        // Format the response
        const formattedData = doctors.map(doctor => ({
            doctorId: doctor.id,
            name: doctor.name,
            experience: doctor.experience,
            profilePic: doctor.profilePic,
            areasOfInterest: doctor.areasOfInterest,
            firstComeFirstServe: doctor.firstComeFirstServe,
            satisfactionScore: doctor.diagnosisScore || 0,
            rating: doctor.rating || 0,
            specialityId: doctor.specialityId,
            specialityName: doctor.specialityName,
            diagnosisScore: doctor.diagnosisScore,
            degree: doctor.degree,
            reviewsCount: doctor.totalReviews,
            isPromotional: DoctorBadgesUtil.isPromotional(doctor.id),
            isTopBooked: DoctorBadgesUtil.isTopBooked(doctor.id),
            hospitals: hospitalsByDoctor[doctor.id] || [],
        }));

        return {
            doctors: formattedData,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: number) {
        const doctor = await this.doctorRepository.findOne({ where: { id } });
        if (!doctor) {
            throw new HttpError(404, `Doctor with ID ${id} not found`);
        }
        return doctor;
    }

    async findDoctorByHospitalId(doctorId: number, hospitalId: number): Promise<DoctorListing | null> {
        if (!doctorId || !hospitalId) {
            throw new HttpError(400, 'Hospital not found');
        }
        return await this.doctorListingRepository.findByDoctorAndHospitalId(doctorId, hospitalId);

    }

    async update(id: number, updateDoctorDto: UpdateDoctorDto) {
        const doctor = await this.findOne(id);
        this.doctorRepository.merge(doctor, updateDoctorDto);
        return this.doctorRepository.save(doctor);
    }

    async remove(id: number) {
        const doctor = await this.findOne(id);
        return this.doctorRepository.remove(doctor);
    }

    async getDoctorProfile(doctorId: number, userId?: number, deviceId?: string) {
        // Fetch doctor profile using repository
        const doctor = await this.doctorRepository.findDoctorProfile(doctorId);

        if (!doctor) {
            throw new HttpError(404, `Doctor with ID ${doctorId} not found`);
        }

        // Track doctor profile visit
        if (doctorId) {
            this.userRecentSearchService.trackRecentSearch({ doctorId }, userId, deviceId).catch(err => console.error('Error tracking doctor profile visit', err));
        }

        let corporateUser = null;
        if (userId) {
            corporateUser = await this.corporateService.getCorporateUserDetails(userId);
        }
        // Fetch all hospital listings for this doctor
        const rawHospitalsData = await this.doctorListingRepository.getDoctorHospitals(doctorId);
        const hospitals = await Promise.all(
            rawHospitalsData.map(async (obj) => {
                const options: DiscountOptions = {
                    fee: obj.fee,
                    discountFee: obj.discountFee,
                    hospitalType: obj.hospitalType,
                    isOnlinePaymentEnabled: obj.isOnlinePaymentEnabled,
                    isCorporateUser: (corporateUser !== null),
                    corporateAppointmentDiscount: corporateUser?.appointmentDiscountPercentage,
                    corporateConsultationDiscount: corporateUser?.videoConsultationDiscountPercentage
                };
                const { finalDiscountFee, discountPercentage } = await this.calculateDiscount(options);
                const {hospital, ...otherValues} = obj;
                return {
                    ...otherValues,
                    discountFee: (obj.fee != finalDiscountFee ? finalDiscountFee : 0),
                    discount: finalDiscountFee ? (obj.fee - finalDiscountFee) : 0,
                    discountPercentage: discountPercentage || 0,
                    doctorHospitalId: obj.id,
                    isLocationVerified: (hospital?.locationVerifiedAt !== null)
                };
            })
        );
        doctor.specialityId = hospitals[0]?.specialityId;
        const reviews = await this.getDoctorReviews({ doctorId, isPublished: 1, page: 1 }, 3);
        const reviewStats = await this.doctorReviewRepository.getDoctorReviewStats(doctorId);
        const experiences = await this.doctorExperienceRepository.getDoctorExperiences(doctorId);
        const qualifications = await this.doctorQualificationRepository.getDoctorQualifications(doctorId);
        // Normalize dates in experiences and qualifications
        const normalizedExperiences = DateUtil.normalizeDates(experiences);
        const normalizedQualifications = DateUtil.normalizeDates(qualifications);
        // Fetch services linked with the doctor
        const services = await this.doctorRepository.getDoctorServices(doctorId);
        // Fetch diseases linked with the doctor's speciality
        const diseases = await this.doctorRepository.getDoctorDiseases(doctor.specialityId);

        // Generate FAQs dynamically
        const faqs = this.generateDoctorFaqs(doctor, hospitals);

        // Convert aboutMe from HTML to Markdown
        const aboutMeMarkdown = doctor.aboutMe ? HtmlUtil.convertHtmlToMarkdown(doctor.aboutMe) : null;

        // Check if doctor is in user's favorites
        let addedToFavourites = false;
        if (userId) {
            addedToFavourites = await this.usersService?.isDoctorFavorited(userId, doctorId);
        }

        doctor.averageWaitingTime = doctor.averageWaitingTime ?? '';
        doctor.averageAppointmentTime = doctor.averageAppointmentTime ?? '';
        doctor.patientSatisfactionScore = Math.round(reviewStats.positive_satisfaction_score * 0.01 * 5);
        doctor.diagnosisScore = Math.round(doctor.diagnosisScore * 0.01 * 5);
        doctor.staffScore = Math.round(doctor.staffScore * 0.01 * 5);
        doctor.clinicEnvironmentScore = Math.round(reviewStats.inclinic_score);
        const specialityName = hospitals[0]?.specialityName || '';
        const similarSpecialities = hospitals[0]?.similarSpecialities || '';
        const categoryName = hospitals[0]?.categoryName || '';
        doctor.rating = doctor.rating ?? 0;

        return {
            ...doctor,
            aboutMe: aboutMeMarkdown,
            addedToFavourites,
            isPromotional: DoctorBadgesUtil.isPromotional(doctorId),
            isTopBooked: DoctorBadgesUtil.isTopBooked(doctorId),
            hospitals,
            reviews,
            experiences: normalizedExperiences,
            qualifications: normalizedQualifications,
            services,
            diseases,
            categoryName,
            specialityName,
            similarSpecialities,
            faqs
        };
    }

    private generateDoctorFaqs(doctor: any, hospitals: any[]) {
        let faqs = "";

        // FAQ 1: How to book an appointment
        if (hospitals.length > 0) {
            faqs += `### How to book an appointment with ${doctor.name}?\n`;
            faqs += `Call at 0311 - 1222398. You do not have to pay any extra fee for booking an appointment through Marham.\n\n`;
            faqs += `-- -\n\n`;
        }

        // FAQ 2: Qualification
        if (doctor.degree) {
            faqs += `### What is the Qualification of ${doctor.name}?\n`;
            faqs += `${doctor.name} has the following degrees: ${doctor.degree} \n\n`;
            faqs += `-- -\n\n`;
        }

        // FAQ 3: Speciality
        faqs += `### What is ${doctor.name} 's speciality & area of expertise?\n`;
        faqs += `${doctor.name} is a specialist.\n\n`;
        faqs += `---\n\n`;

        // FAQ 4: Contact number
        faqs += `### What is ${doctor.name}'s contact number?\n`;
        faqs += `You can contact the doctor through Marham's helpline: [0311-1222398](tel:0311-1222398) and we'll connect you with ${doctor.name}\n\n`;
        faqs += `---\n\n`;

        // FAQ 5: Fee
        if (hospitals.length > 0 && hospitals[0].fee) {
            faqs += `### What is the fee of ${doctor.name}?\n`;
            faqs += `${doctor.name} charges Rs. ${hospitals[0].fee} for consultation.\n\n`;
            faqs += `---\n\n`;
        }

        // FAQ 6: Practice timings
        if (hospitals.length > 0) {
            faqs += `### Practice timings of ${doctor.name} are:\n`;

            // Group hospitals by name to consolidate timings
            const hospitalGroups = new Map<string, any[]>();

            hospitals.forEach(hospital => {
                const hospitalName = hospital.hospitalName || 'Hospital';
                if (!hospitalGroups.has(hospitalName)) {
                    hospitalGroups.set(hospitalName, []);
                }
                const group = hospitalGroups.get(hospitalName);
                if (group) {
                    group.push(hospital);
                }
            });

            // Process each hospital group
            hospitalGroups.forEach((hospitalListings, hospitalName) => {
                faqs += `\n**${hospitalName}**\n\n`;

                const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

                // Consolidate timings by day
                const dayTimings = new Map<string, string[]>();

                dayKeys.forEach((dayKey, index) => {
                    const timeSlotsForDay: string[] = [];

                    hospitalListings.forEach(listing => {
                        if (listing[dayKey] && listing.startTime && listing.endTime) {
                            const timeSlot = `${listing.startTime} - ${listing.endTime}`;
                            if (!timeSlotsForDay.includes(timeSlot)) {
                                timeSlotsForDay.push(timeSlot);
                            }
                        }
                    });

                    if (timeSlotsForDay.length > 0) {
                        dayTimings.set(days[index], timeSlotsForDay);
                    }
                });

                // Generate Markdown for each day with timings
                dayTimings.forEach((timeSlots, dayName) => {
                    faqs += `**${dayName}**\n`;
                    timeSlots.forEach(timeSlot => {
                        faqs += `- ${timeSlot}\n`;
                    });
                    faqs += `\n`;
                });
            });
        }

        return faqs;
    }

    async getDoctorReviews(dto: GetDoctorReviewsDto, limit: number = 100) {
        const { doctorId, isPublished, overallExperience, page } = dto;
        const skip = (page - 1) * limit;

        // Fetch doctor profile using repository
        const doctor = await this.doctorRepository.findDoctorProfile(doctorId);

        if (!doctor) {
            throw new HttpError(404, `Doctor with ID ${doctorId} not found`);
        }

        // Fetch all hospital listings for this doctor
        const reviews = await this.doctorReviewRepository.getDoctorReviews(doctorId, skip, limit, isPublished, overallExperience);

        return reviews.map(review => ({
            ...review,
            waitingTime: ReviewMapperUtil.getWaitingTime(review.waitingTime),
            appointmentDuration: ReviewMapperUtil.getAppointmentDuration(review.appointmentDuration)
        }));
    }

    /**
     * Get filtered doctor reviews with pagination and sorting
     */
    async getFilteredDoctorReviews(dto: GetFilteredDoctorReviewsDto) {
        const { doctorId, filter = 'all', sortBy = 'newest', page = 1, limit } = dto;
        const skip = (page - 1) * limit;

        // Verify doctor exists
        const doctor = await this.doctorRepository.findDoctorProfile(doctorId);
        if (!doctor) {
            throw new HttpError(404, `Doctor with ID ${doctorId} not found`);
        }

        // Get filtered reviews with total count
        const { reviews, total } = await this.doctorReviewRepository.getFilteredDoctorReviews(
            doctorId,
            filter,
            sortBy,
            skip,
            limit
        );

        // Transform reviews data
        const transformedReviews = reviews.map(review => ({
            id: review.id,
            doctorId: review.doctorId,
            experience: review.experience,
            heading: review.heading,
            userName: review.userName,
            satisfied: review.satisfied,
            satisfiedText: this.getSatisfiedText(review.satisfied),
            overallExperience: review.overallExperience,
            recommandation: review.recommandation,
            waitingTime: ReviewMapperUtil.getWaitingTime(review.waitingTime),
            appointmentDuration: ReviewMapperUtil.getAppointmentDuration(review.appointmentDuration),
            staffBehaviour: review.staffBehaviour,
            hospitalEnvironment: review.hospitalEnvironment,
            positiveFeedback: review.positiveFeedback,
            negativeFeedback: review.negativeFeedback,
            resolutionStatus: review.resolutionStatus,
            resolutionStatusText: this.getResolutionStatusText(review.resolutionStatus),
            isPinned: review.isPinned,
            appointmentHospitalName: (review as any)['appointmentHospitalName'],
            createdAt: review.createdAt,
            type: review.type
        }));

        // Calculate pagination metadata
        const lastPage = Math.ceil(total / limit);

        return {
            success: true,
            message: 'Doctor reviews retrieved successfully',
            data: {
                reviews: transformedReviews,
                pagination: {
                    total,
                    page,
                    limit,
                    lastPage
                },
                filters: {
                    applied: filter,
                    sortBy
                }
            }
        };
    }

    private getSatisfiedText(satisfied: number): string {
        switch (satisfied) {
            case 1:
                return 'Positive';
            case 2:
                return 'Negative';
            default:
                return 'Neutral';
        }
    }

    private getResolutionStatusText(status: number): string {
        switch (status) {
            case 0:
                return 'Unresolved';
            case 1:
                return 'Unresolved - Show to Doctor';
            case 2:
                return 'Resolved by Doctor';
            case 3:
                return 'Resolved by Marham';
            case 4:
                return 'Cannot be Resolved';
            default:
                return 'Unknown';
        }
    }

    async getDoctorReviewStats(doctorId: number) {
        // Verify doctor exists
        const doctor = await this.doctorRepository.findDoctorProfile(doctorId);
        if (!doctor) {
            throw new HttpError(404, `Doctor with ID ${doctorId} not found`);
        }

        // Get review statistics by category
        const stats = await this.doctorReviewRepository.getDoctorReviewStatsByCategory(doctorId);

        return {
            doctorId,
            reviewStats: {
                positive: stats.positiveCount,
                neutral: stats.neutralCount,
                negative: stats.negativeCount,
                total: stats.totalCount
            }
        };
    }

    async calculateDiscount(options: DiscountOptions): Promise<DiscountResultDto> {
        const isDoctorDiscount = (options.discountFee && options.discountFee < options.fee);
        let finalFee = isDoctorDiscount ? options.discountFee : options.fee;
        let discountPercentage = 0;
        let finalDiscountFee = 0;
        let discountType = '';

        // Promo code discount overrides all other discounts
        if (options.promoCode) {
            const promoDiscount = Math.floor(finalFee * (Number(options.promoCode.discountPercentage) / 100));
            const finalDiscountFee = finalFee - promoDiscount;
            const discountPercentage = Number(options.promoCode.discountPercentage);
            
            return {
                finalDiscountFee,
                discountPercentage,
                discountType: 'promo_code',
                isDiscountApplied: true
            };
        }

        if (options.isCorporateUser) {
            let corpPercentage = 0;
            if (options.hospitalType === HospitalType.ONLINE) {
                corpPercentage = (options.corporateConsultationDiscount !== undefined) ? options.corporateConsultationDiscount : 0;
            } else {
                corpPercentage = (options.corporateAppointmentDiscount !== undefined) ? options.corporateAppointmentDiscount : 0;
            }

            if (corpPercentage > 0) {
                discountPercentage = corpPercentage;
                finalDiscountFee = Math.round(finalFee - (finalFee * (corpPercentage / 100)));
                discountType = 'corporate_discount';
            } else {
                discountPercentage = 0;
                finalDiscountFee = finalFee;
            }
        }
        // else if (options.hospitalType === HospitalType.PHYSICAL && options.isOnlinePaymentEnabled) {
        //     // Physical Hospital & Online Payment Enabled -> 10% off
        //     discountPercentage = Number(process.env.MARHAM_PHYSICAL_APPOINTMENT_ONLINE_PAYMENT_DISCOUNT_PERCENTAGE || 10);
        //     finalDiscountFee = Math.round(finalFee * 0.9);
        //     discountType = 'online_discount';
        // } 
        else if (isDoctorDiscount) {
            // Doctor offering discount
            finalDiscountFee = options.discountFee;
            discountPercentage = Math.round(((options.fee - options.discountFee) / options.fee) * 100);
            discountType = 'doctor_discount';
        } else {
            const marhamDiscount = options.hospitalType === HospitalType.PHYSICAL ?
                Number(process.env.MARHAM_PHYSICAL_APPOINTMENT_DISCOUNT_PERCENTAGE || 0) :
                Number(process.env.MARHAM_ONLINE_CONSULTATION_DISCOUNT_PERCENTAGE || 0);
            if (marhamDiscount > 0) {
                discountPercentage = marhamDiscount;
                finalDiscountFee = Math.round(finalFee - (finalFee * (marhamDiscount / 100)));
                discountType = 'marham_discount';
            }
        }

        const isDiscountApplied = discountPercentage > 0 || finalDiscountFee > 0;
        return { finalDiscountFee, discountPercentage, discountType, isDiscountApplied };
    }

    async createReview(createDoctorReviewDto: CreateDoctorReviewDto, user: { id: number; name: string; email: string }) {
        const {
            doctorId,
            overallExperience,
            description,
            waitingTime = 0,
            appointmentDuration = 0,
            diagnosisSatisfied = 0,
            easyToUse = 0,
            hospitalEnvironment = 0,
            staffBehaviour = 0,
            hospitalType = 1,
            isAnonymous = false,
            appointmentId = 0
        } = createDoctorReviewDto;

        if (!doctorId || overallExperience === undefined) {
            throw new Error('Doctor ID and overall experience are required');
        }

        let userName = user.name;
        if (isAnonymous) {
            userName = StringUtil.makeNameAnonymous(userName);
        }

        const isPublished = (overallExperience === 1);

        const reviewData = {
            doctorId,
            feedback: (overallExperience === 1) ? true : false,
            overallExperience: (overallExperience === 1) ? true : false,
            experience: description,
            userId: user.id.toString(),
            userEmail: user.email,
            userName: userName,
            type: 1, // User entered review
            appType: 1, // Legacy value
            deviceType: 3, // Legacy value
            isAnonymous: isAnonymous ? 1 : 0,
            hospitalEnvironment: !!hospitalEnvironment,
            waitingTime,
            appointmentDuration,
            satisfied: diagnosisSatisfied,
            staffBehaviour: !!staffBehaviour,
            easyToUse: !!easyToUse,
            hospitalType,
            isPublished, // publishedByDoctor logic
            approvedAt: new Date(),
            approvedBy: 1, // Default system user ID or similar
            appointmentId
        };

        const review = this.doctorReviewRepository.create(reviewData);
        const savedReview = await this.doctorReviewRepository.save(review);
        if (appointmentId) {
            await this.appointmentsService.markAsReviewed(BigInt(appointmentId));
        }
        return savedReview;
    }

    async markDoctorOnlineOffline(doctorId: number, isOnline: boolean): Promise<any> {
        try {
            // Update the is_online status in doctor_corporate_influx_shift_timings table
            await this.doctorListingRepository.updateDoctorOnlineStatus(doctorId, isOnline);

            // If marking as online, call the external API to schedule next call
            if (isOnline) {
                const marhamUrl = this.configService.get('cdn.marhamUrl');
                const apiUrl = `${marhamUrl}api/admin/influx/schedule-next-call`;

                try {
                    await firstValueFrom(
                        this.httpService.post(apiUrl, { doctor_id: doctorId })
                    );
                    this.logger.log(`Successfully called schedule-next-call API for doctor ${doctorId}`);
                } catch (error) {
                    this.logger.error(`Failed to call schedule-next-call API for doctor ${doctorId}:`, error.message);
                    // Don't throw error here as the main operation (marking online) was successful
                }
            }

            const statusText = isOnline ? 'online' : 'offline';
            return {
                message: `Doctor marked as ${statusText} successfully`,
                doctorId,
                isOnline
            };
        } catch (error) {
            this.logger.error(`Error marking doctor ${doctorId} as ${isOnline ? 'online' : 'offline'}:`, error.message);
            throw error;
        }
    }
}
