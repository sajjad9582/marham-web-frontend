// @ts-nocheck
import type { RowDataPacket } from "mysql2";
import { and, asc, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import dayjs from "dayjs";
import trim from "lodash/trim.js";
import { db, pool } from "@/lib/db";
import { getConfig } from "@/lib/db/config";
import type { DoctorSearchParams } from "@/lib/db/interfaces/doctor-search-params.interface";
import type { DoctorWithSpeciality } from "@/lib/db/interfaces/doctor-with-speciality.interface";
import {
  diseases,
  doctorAreasOfInterest,
  doctorExperiences,
  doctorListings,
  doctorQualifications,
  doctorReviews,
  doctors,
  globalAreasOfInterest,
  hospitals,
  services,
  doctorServices,
} from "@/lib/db/schema";
import { DoctorImageUtil } from "@/lib/db/utils";
import { timeSlotToTimeString } from "@/lib/timeslot-filter-options";

const EXCLUDED_DOCTOR_IDS = [6581, 6582, 24287, 29048, 29117, 8507, 32877];
const REVIEW_COUNT_SQL = `(SELECT COUNT(r.id) FROM doctor_reviews r WHERE r.dID = doctor.dlID AND r.deleted_at IS NULL AND r.publishedByDoctor = 1)`;
const LISTING_PARSED_START_TIME = `TIME(COALESCE(
  STR_TO_DATE(NULLIF(listing_filter.startTime,''), '%h:%i %p'),
  STR_TO_DATE(NULLIF(listing_filter.startTime,''), '%H:%i')
))`;
const LISTING_PARSED_END_TIME = `TIME(COALESCE(
  STR_TO_DATE(NULLIF(listing_filter.endTime,''), '%h:%i %p'),
  STR_TO_DATE(NULLIF(listing_filter.endTime,''), '%H:%i')
))`;
const WEEKDAY_COLUMNS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;
const configService = { get: getConfig };

export type DoctorRow = typeof doctors.$inferSelect;
export type DoctorListingRow = typeof doctorListings.$inferSelect;

export async function findDoctorById(id: number): Promise<DoctorRow | null> {
  const rows = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAreasOfInterestByDoctorIds(
  doctorIds: number[],
): Promise<Map<number, string[]>> {
  const map = new Map<number, string[]>();
  if (doctorIds.length === 0) return map;

  const rows = await db
    .select({
      title: globalAreasOfInterest.title,
      doctorId: doctorAreasOfInterest.doctorId,
    })
    .from(globalAreasOfInterest)
    .innerJoin(
      doctorAreasOfInterest,
      eq(doctorAreasOfInterest.areaOfInterestId, sql`CAST(${globalAreasOfInterest.id} AS CHAR)`),
    )
    .where(
      and(
        inArray(doctorAreasOfInterest.doctorId, doctorIds.map(String)),
        isNull(globalAreasOfInterest.deletedAt),
      ),
    );

  for (const row of rows) {
    const doctorId = Number(row.doctorId);
    const title = trim(row.title ?? "");
    if (!map.has(doctorId)) map.set(doctorId, []);
    map.get(doctorId)!.push(title);
  }
  return map;
}

export async function findDoctorsWithFilters(
  params: DoctorSearchParams,
): Promise<[DoctorWithSpeciality[], number]> {
  const {
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
    ids,
    consultationType,
    sortBy,
    sortDirection,
    availableToday,
    timeSlot,
    discounts,
    topReviewed,
    onlineNow,
    limit,
    skip,
    isOnPanelOnly,
    hospitalId,
  } = params;

  const conditions: string[] = [
    `doctor.dlID NOT IN (${EXCLUDED_DOCTOR_IDS.join(",")})`,
  ];
  const queryParams: unknown[] = [];

  if (ids?.length) {
    conditions.push(`doctor.dlID IN (${ids.map(() => "?").join(",")})`);
    queryParams.push(...ids);
  }
  if (isOnPanelOnly) {
    conditions.push("doctor.on_panel = ?");
    queryParams.push(1);
    conditions.push("doctor.active_at IS NOT NULL");
    conditions.push("doctor.inactive_at IS NULL");
  }
  if (hospitalId) {
    conditions.push("listing_filter.hospitalID = ?");
    queryParams.push(String(hospitalId));
  }
  if (specialityIds?.length) {
    const placeholders = specialityIds.map(() => "?").join(",");
    conditions.push(`(
      listing_filter.speciality_id IN (${placeholders})
      OR listing_filter.similar_id_1 IN (${placeholders})
      OR listing_filter.similar_id_2 IN (${placeholders})
      OR listing_filter.similar_id_3 IN (${placeholders})
      OR listing_filter.similar_id_4 IN (${placeholders})
      OR listing_filter.similar_id_5 IN (${placeholders})
    )`);
    queryParams.push(...specialityIds, ...specialityIds, ...specialityIds, ...specialityIds, ...specialityIds, ...specialityIds);
  }

  let serviceJoin = "";
  if (serviceId) {
    serviceJoin = "INNER JOIN servicesdoctor sd ON sd.dID = doctor.dlID";
    conditions.push("sd.sID = ?");
    queryParams.push(serviceId);
  }

  let diseaseJoin = "";
  if (diseaseId) {
    diseaseJoin =
      "INNER JOIN diseases disease ON disease.spID = listing_filter.speciality_id AND disease.id = ?";
    queryParams.push(diseaseId);
  }

  const extraSelects: string[] = [];
  if (city) {
    extraSelects.push("listing_filter.hospitalCity as hospitalCity");
    conditions.push("listing_filter.hospitalCity = ?");
    queryParams.push(city);
  }
  if (area) {
    extraSelects.push("listing_filter.hospitalArea as hospitalArea");
    conditions.push("listing_filter.hospitalArea = ?");
    queryParams.push(area);
  }
  if (gender && gender !== "all") {
    conditions.push("doctor.gender = ?");
    queryParams.push(gender === "male" ? 1 : 0);
  }
  if (isFree) {
    conditions.push("listing_filter.docFee = 0");
  } else {
    if (minFee !== undefined) {
      conditions.push("listing_filter.docFee >= ?");
      queryParams.push(minFee);
    }
    if (maxFee !== undefined) {
      conditions.push("listing_filter.docFee <= ?");
      queryParams.push(maxFee);
    }
  }
  if (consultationType) {
    conditions.push("listing_filter.hospital_type = ?");
    queryParams.push(String(consultationType));
  }
  if (availableToday) {
    const todayColumn = WEEKDAY_COLUMNS[dayjs().day()];
    conditions.push(`listing_filter.${todayColumn} = 1`);
  }
  if (onlineNow) {
    const todayColumn = WEEKDAY_COLUMNS[dayjs().day()];
    conditions.push("listing_filter.hospital_type = ?");
    queryParams.push("2");
    conditions.push(`listing_filter.${todayColumn} = 1`);
    conditions.push("listing_filter.startTime IS NOT NULL");
    conditions.push("listing_filter.endTime IS NOT NULL");
    conditions.push("listing_filter.startTime != ''");
    conditions.push("listing_filter.endTime != ''");
    conditions.push(
      `CURTIME() BETWEEN ${LISTING_PARSED_START_TIME} AND ${LISTING_PARSED_END_TIME}`,
    );
    conditions.push(`(
      listing_filter.on_leave = 0
      OR (
        listing_filter.on_leave = 1
        AND CURDATE() NOT BETWEEN listing_filter.on_leave_from AND listing_filter.on_leave_to
      )
    )`);
  }
  if (timeSlot !== undefined) {
    conditions.push(`listing_filter.startTime IS NOT NULL`);
    conditions.push(`listing_filter.endTime IS NOT NULL`);
    conditions.push(`listing_filter.startTime != ''`);
    conditions.push(`listing_filter.endTime != ''`);
    conditions.push(`(
      listing_filter.monday = 1 OR listing_filter.tuesday = 1 OR listing_filter.wednesday = 1
      OR listing_filter.thursday = 1 OR listing_filter.friday = 1 OR listing_filter.saturday = 1
      OR listing_filter.sunday = 1
    )`);
    conditions.push(`? BETWEEN ${LISTING_PARSED_START_TIME} AND ${LISTING_PARSED_END_TIME}`);
    queryParams.push(timeSlotToTimeString(timeSlot));
  }
  if (discounts) {
    const discountCityClause = city ? "AND dl_disc.hospitalCity = ?" : "";
    conditions.push(`EXISTS (
      SELECT 1 FROM doclisting dl_disc
      WHERE dl_disc.dlID = doctor.dlID
        AND dl_disc.discountFee > 0
        AND dl_disc.discountFee < dl_disc.docFee
        AND dl_disc.deleted_at IS NULL
        AND dl_disc.active_at IS NOT NULL
        AND dl_disc.inactive_at IS NULL
        ${discountCityClause}
    )`);
    if (city) {
      queryParams.push(city);
    }
  }

  const direction = sortDirection || (sortBy === "experience" ? "DESC" : "ASC");
  let orderBy = "doctor.on_panel DESC, doctor.points DESC, doctor.dlID ASC";
  const orderParams: unknown[] = [];

  if (sortBy === "fee") {
    orderBy = `listing_filter.docFee ${direction}`;
  } else if (sortBy === "experience") {
    orderBy = `doctor.docExp ${direction}`;
  } else if (lat && lng) {
    extraSelects.push(
      `(6371 * acos(cos(radians(?)) * cos(radians(listing_filter.lat)) * cos(radians(listing_filter.lng) - radians(?)) + sin(radians(?)) * sin(radians(listing_filter.lat)))) as distance`,
    );
    orderBy = "distance ASC";
    orderParams.push(lat, lng, lat);
  } else if (topReviewed) {
    orderBy = "totalReviews DESC";
  }

  const selectClause = [
    "doctor.dlID as id",
    "doctor.docName as name",
    "doctor.docExp as experience",
    "doctor.docPic as profilePic",
    "doctor.gender as gender",
    "doctor.docDegree as degree",
    "doctor.first_come_first_serve as firstComeFirstServe",
    "doctor.average_waiting_time as averageWaitingTime",
    "doctor.staff_score as staffScore",
    "doctor.spID as specialityId",
    "doctor.diagnosis_score as diagnosisScore",
    "doctor.rating as rating",
    "doctor.points as points",
    "listing_filter.speciality_name as specialityName",
    "listing_filter.doctorSlug as doctorSlug",
    `${REVIEW_COUNT_SQL} as totalReviews`,
    ...extraSelects,
  ].join(", ");


  const baseFrom = `
    FROM docdetails doctor
    INNER JOIN doclisting listing_filter
      ON listing_filter.dlID = doctor.dlID
      AND listing_filter.deleted_at IS NULL
      AND listing_filter.active_at IS NOT NULL
      AND listing_filter.inactive_at IS NULL
    ${serviceJoin}
    ${diseaseJoin}
    WHERE ${conditions.join(" AND ")}
    GROUP BY doctor.dlID
  `;

  const dataSql = `
    SELECT ${selectClause}
    ${baseFrom}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const countSql = `SELECT COUNT(*) as total FROM (SELECT doctor.dlID ${baseFrom}) as grouped`;

  const [dataResult, countResult] = await Promise.all([
    pool.query<RowDataPacket[]>(dataSql, [...orderParams, ...queryParams, limit, skip]),
    pool.query<RowDataPacket[]>(countSql, [...orderParams, ...queryParams]),
  ]);

  const rawRows = dataResult[0];
  const total = Number(countResult[0][0]?.total ?? 0);
  const doctorIds = rawRows.map((r) => Number(r.id));
  const areasMap = await getAreasOfInterestByDoctorIds(doctorIds);

  const doctorsWithSpeciality: DoctorWithSpeciality[] = rawRows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    experience: row.experience,
    profilePic: DoctorImageUtil.getDoctorImageUrl(
      configService,
      Number(row.id),
      row.profilePic,
      row.gender || 1,
    ),
    gender: row.gender,
    degree: row.degree,
    firstComeFirstServe: row.firstComeFirstServe,
    averageWaitingTime: row.averageWaitingTime,
    staffScore: row.staffScore,
    specialityId: Number(row.specialityId),
    diagnosisScore: row.diagnosisScore,
    rating: row.rating,
    points: row.points,
    specialityName: row.specialityName ?? null,
    doctorSlug: row.doctorSlug ?? null,
    totalReviews: row.totalReviews ? parseInt(String(row.totalReviews), 10) : 0,
    areasOfInterest: areasMap.get(Number(row.id)) || [],
  }));

  return [doctorsWithSpeciality, total];
}

export async function findDoctorProfile(doctorId: number) {
  const rows = await db
    .select({
      id: doctors.id,
      name: doctors.name,
      aboutMe: doctors.aboutMe,
      degree: doctors.degree,
      experience: doctors.experience,
      gender: doctors.gender,
      profilePic: doctors.profilePic,
      interview: doctors.interview,
      onPanel: doctors.onPanel,
      averageWaitingTime: doctors.averageWaitingTime,
      averageAppointmentTime: doctors.averageAppointmentTime,
      diagnosisScore: doctors.diagnosisScore,
      staffScore: doctors.staffScore,
      rating: doctors.rating,
      categoryId: doctors.categoryId,
      reviewsCount: sql<number>`(
        SELECT COUNT(review.id) FROM doctor_reviews review
        WHERE review.dID = ${doctors.id}
        AND review.deleted_at IS NULL
        AND review.publishedByDoctor = 1
      )`,
    })
    .from(doctors)
    .where(
      and(
        eq(doctors.id, doctorId),
        isNotNull(doctors.activeAt),
        isNull(doctors.inactiveAt),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const areasMap = await getAreasOfInterestByDoctorIds([doctorId]);
  return {
    ...row,
    reviewsCount: Number(row.reviewsCount) || 0,
    profilePic: DoctorImageUtil.getDoctorImageUrl(
      configService,
      row.id,
      row.profilePic,
      row.gender || 1,
    ),
    doctorId: row.id,
    doctorName: row.name,
    areasOfInterest: areasMap.get(doctorId) || [],
  };
}

export async function getDoctorServices(doctorId: number) {
  return db
    .select({ id: services.id, name: services.name })
    .from(services)
    .innerJoin(doctorServices, eq(doctorServices.serviceId, services.id))
    .where(eq(doctorServices.doctorId, String(doctorId)));
}

export async function getDoctorDiseases(specialityId: number, limit = 10) {
  return db
    .select({ id: diseases.id, name: diseases.disease })
    .from(diseases)
    .where(eq(diseases.spId, String(specialityId)))
    .limit(limit);
}

export async function findHospitalsByDoctors(params: {
  doctorIds: number[];
  city?: string;
  area?: string;
}) {
  const { doctorIds, city, area } = params;
  if (doctorIds.length === 0) return [];

  const conditions = [
    inArray(doctorListings.doctorId, doctorIds.map(String)),
    isNull(doctorListings.deletedAt),
    isNotNull(doctorListings.activeAt),
    isNull(doctorListings.inactiveAt),
  ];
  if (city) conditions.push(eq(doctorListings.hospitalCity, city));
  if (area) conditions.push(eq(doctorListings.hospitalArea, area));

  const rows = await db
    .select({
      listing: doctorListings,
      hospitalLat: hospitals.lat,
      hospitalLng: hospitals.lng,
      locationVerifiedAt: hospitals.locationVerifiedAt,
    })
    .from(doctorListings)
    .leftJoin(hospitals, eq(doctorListings.hospitalId, sql`CAST(${hospitals.id} AS CHAR)`))
    .where(and(...conditions));

  return rows.map((row) => ({
    ...row.listing,
    hospital: {
      lat: row.hospitalLat,
      lng: row.hospitalLng,
      locationVerifiedAt: row.locationVerifiedAt,
    },
  }));
}

export async function getDoctorHospitals(doctorId: number) {
  const rows = await db
    .select({
      listing: doctorListings,
      hospitalId: hospitals.id,
      locationVerifiedAt: hospitals.locationVerifiedAt,
    })
    .from(doctorListings)
    .leftJoin(hospitals, eq(doctorListings.hospitalId, sql`CAST(${hospitals.id} AS CHAR)`))
    .where(
      and(
        eq(doctorListings.doctorId, String(doctorId)),
        isNull(doctorListings.deletedAt),
        isNotNull(doctorListings.activeAt),
        isNull(doctorListings.inactiveAt),
      ),
    )
    .orderBy(desc(doctorListings.hospitalType), asc(doctorListings.hospitalName));

  return rows.map((row) => ({
    ...row.listing,
    hospital: row.hospitalId
      ? { id: row.hospitalId, locationVerifiedAt: row.locationVerifiedAt }
      : null,
  }));
}

export async function findDoctorListingById(id: number) {
  const rows = await db
    .select()
    .from(doctorListings)
    .where(
      and(
        eq(doctorListings.id, id),
        isNotNull(doctorListings.activeAt),
        isNull(doctorListings.inactiveAt),
        isNull(doctorListings.deletedAt),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getDoctorReviews(
  doctorId: number,
  skip: number,
  limit: number,
  isPublished?: number,
) {
  const conditions = [
    eq(doctorReviews.doctorId, String(doctorId)),
    isNull(doctorReviews.deletedAt),
  ];
  if (isPublished) conditions.push(eq(doctorReviews.isPublished, isPublished));

  return db
    .select({
      id: doctorReviews.id,
      doctorId: doctorReviews.doctorId,
      experience: doctorReviews.experience,
      overallExperience: doctorReviews.overallExperience,
      userName: doctorReviews.userName,
      waitingTime: doctorReviews.waitingTime,
      staffBehaviour: doctorReviews.staffBehaviour,
      hospitalEnvironment: doctorReviews.hospitalEnvironment,
      appointmentDuration: doctorReviews.appointmentDuration,
      appointmentId: doctorReviews.appointmentId,
      heading: doctorReviews.heading,
      type: doctorReviews.type,
      isPinned: doctorReviews.isPinned,
      createdAt: doctorReviews.createdAt,
    })
    .from(doctorReviews)
    .where(and(...conditions))
    .orderBy(
      desc(doctorReviews.isPinned),
      desc(doctorReviews.experience),
      desc(doctorReviews.id),
    )
    .offset(skip)
    .limit(limit);
}

export async function getDoctorReviewStats(doctorId: number) {
  const result = await pool.query<RowDataPacket[]>(
    `SELECT
      IFNULL(ROUND((
        COUNT(CASE WHEN reviews.publishedByDoctor = 1 AND reviews.hospital_type = 1 AND reviews.overall_experience = 1 THEN 1 END)
        / NULLIF(COUNT(CASE WHEN reviews.publishedByDoctor = 1 AND reviews.hospital_type = 1 THEN 1 END), 0)
      ) * 5, 1), 0) as inclinic_score,
      ROUND((COUNT(IF(reviews.overall_experience = 1, id, NULL)) / COUNT(*)) * 100) as positive_satisfaction_score
    FROM doctor_reviews reviews
    WHERE reviews.dID = ?
    AND reviews.deleted_at IS NULL
    LIMIT 1`,
    [doctorId],
  );
  return result[0][0] ?? { inclinic_score: 0, positive_satisfaction_score: 0 };
}

export async function getDoctorExperiences(doctorId: number) {
  return db
    .select({
      id: doctorExperiences.id,
      doctorId: doctorExperiences.doctorId,
      designation: doctorExperiences.designation,
      institute: doctorExperiences.institute,
      yearFrom: doctorExperiences.yearFrom,
      yearTo: doctorExperiences.yearTo,
      years: doctorExperiences.years,
    })
    .from(doctorExperiences)
    .where(eq(doctorExperiences.doctorId, String(doctorId)))
    .orderBy(desc(doctorExperiences.yearFrom));
}

export async function getDoctorQualifications(doctorId: number) {
  return db
    .select({
      id: doctorQualifications.id,
      doctorId: doctorQualifications.doctorId,
      qualification: doctorQualifications.qualification,
      institute: doctorQualifications.institute,
      yearFrom: doctorQualifications.yearFrom,
      yearTo: doctorQualifications.yearTo,
      status: doctorQualifications.status,
    })
    .from(doctorQualifications)
    .where(eq(doctorQualifications.doctorId, String(doctorId)))
    .orderBy(desc(doctorQualifications.yearFrom));
}
