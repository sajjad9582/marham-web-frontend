/**
 * Doctor Badges Utility
 * 
 * Utility functions for checking and applying doctor badges.
 * Currently uses hardcoded doctor IDs. Will be replaced with dynamic logic
 * once the badge feature is fully built.
 */

import { PROMOTIONAL_BADGE_DOCTOR_IDS, TOP_BOOKED_BADGE_DOCTOR_IDS } from '@/lib/server/utils/doctor-badges.constants';

export class DoctorBadgesUtil {

  /**
   * Check if a doctor has the promotional badge
   * @param doctorId - The doctor ID to check
   * @returns true if doctor has promotional badge, false otherwise
   */
  static isPromotional(doctorId: number): boolean {
    return PROMOTIONAL_BADGE_DOCTOR_IDS.includes(doctorId);
  }

  /**
   * Check if a doctor has the top booked badge
   * @param doctorId - The doctor ID to check
   * @returns true if doctor has top booked badge, false otherwise
   */
  static isTopBooked(doctorId: number): boolean {
    return TOP_BOOKED_BADGE_DOCTOR_IDS.includes(doctorId);
  }

  /**
   * Get all badges for a doctor
   * @param doctorId - The doctor ID to check
   * @returns object with badge flags
   */
  static getBadges(doctorId: number): { isPromotional: boolean; isTopBooked: boolean } {
    return {
      isPromotional: this.isPromotional(doctorId),
      isTopBooked: this.isTopBooked(doctorId)
    };
  }

}
