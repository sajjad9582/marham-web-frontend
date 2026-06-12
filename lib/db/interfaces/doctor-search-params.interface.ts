export interface DoctorSearchParams {
    specialityIds?: number[];
    serviceId?: number;
    diseaseId?: number;
    city?: string;
    area?: string;
    minFee?: number;
    maxFee?: number;
    gender?: 'male' | 'female' | 'all';
    isFree?: boolean;
    lat?: number;
    lng?: number;
    limit: number;
    skip: number;
    ids?: number[];
    consultationType?: number;
    sortBy?: 'fee' | 'experience';
    sortDirection?: 'ASC' | 'DESC';
    availableToday?: boolean;
    timeSlot?: number;
    discounts?: boolean;
    isOnPanelOnly?: boolean;
    hospitalId?: number;
}
