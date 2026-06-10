import { HttpError } from "@/lib/server/http-error";
import type { DataSource } from "typeorm";
import { UserRepository } from "@/lib/server/repositories/user.repository";
import { MedicalShareableRepository } from "@/lib/server/repositories/medical-shareable.repository";
import { UserFriendsAndFamilyRepository } from "@/lib/server/repositories/user-friends-and-family.repository";
import { UpdateUserProfileDto } from "@/lib/server/dto/update-user-profile.dto";
import { User } from "@/lib/server/entities";
import { formatPhoneNumber } from "@/lib/server/utils/phone.util";
import type { DoctorsService } from "@/lib/server/services/doctors.service";

export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly medicalShareableRepository: MedicalShareableRepository,
    private readonly userFriendsAndFamilyRepository: UserFriendsAndFamilyRepository,
    private readonly dataSource: DataSource,
    private doctorsService?: DoctorsService,
  ) {}

  setDoctorsService(doctorsService: DoctorsService) {
    this.doctorsService = doctorsService;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpError(404, `User with ID ${id} not found`);
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone);
  }

  async createWithPhone(phone: string, additionalData: Partial<User> = {}): Promise<User> {
    const formattedPhone = formatPhoneNumber(phone);
    const existingUser = await this.findByPhone(formattedPhone);
    if (existingUser) {
      return existingUser;
    }
    const user = this.userRepository.create({
      phone: formattedPhone,
      ...additionalData,
    });
    return this.userRepository.save(user);
  }

  async updateProfile(id: number, updateUserProfileDto: UpdateUserProfileDto): Promise<Partial<User>> {
    let user = await this.findOne(id);

    if (updateUserProfileDto.name) user.name = updateUserProfileDto.name;
    if (updateUserProfileDto.email) user.email = updateUserProfileDto.email;
    if (updateUserProfileDto.gender) user.gender = updateUserProfileDto.gender;
    if (updateUserProfileDto.dob) user.dateOfBirth = new Date(updateUserProfileDto.dob);
    if (updateUserProfileDto.marital_status) user.maritalStatus = updateUserProfileDto.marital_status;

    user = await this.userRepository.save(user);
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
    };
  }

  async isDoctorFavorited(userId: number, doctorId: number): Promise<boolean> {
    return this.medicalShareableRepository.isDoctorFavorited(userId, doctorId);
  }

  async getFriendsAndFamily(userId: number) {
    const records = await this.userFriendsAndFamilyRepository.findAllByUserId(userId);
    if (records.length === 0) return [];

    const relationUserIds = records.map((r) => r.relationUserId);
    const users = await this.userRepository.findByIds(relationUserIds);
    const recordMap = new Map(records.map((r) => [r.relationUserId, { id: r.id, relationType: r.relationType }]));

    return users.map((user) => ({
      ...user,
      id: user.id,
      relationType: recordMap.get(user.id)?.relationType,
    }));
  }

  async validateUserAccess(authenticatedUserId: number, targetUserId: number): Promise<void> {
    if (authenticatedUserId === targetUserId) return;

    const familyMembers = await this.getFriendsAndFamily(authenticatedUserId);
    const isFamilyMember = familyMembers.some((member) => member.id === targetUserId);

    if (!isFamilyMember) {
      throw new HttpError(400, "You can only perform this action for yourself or your family members.");
    }
  }
}
