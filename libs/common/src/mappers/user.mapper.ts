import type { UserProfile, Address, UserPreferences } from '../types';

export type UserDoc = {
  authUserId: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  address?: Address;
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
};

export function toUserProfile(user: UserDoc | null): UserProfile | null {
  if (!user) return null;
  return {
    authUserId: user.authUserId,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt?.toISOString(),
    profilePicture: user.profilePicture,
    bio: user.bio,
    dateOfBirth: user.dateOfBirth?.toISOString(),
    phoneNumber: user.phoneNumber,
    address: user.address,
    preferences: user.preferences,
    createdAt: (user.createdAt ?? new Date()).toISOString(),
    updatedAt: (user.updatedAt ?? new Date()).toISOString(),
  };
}

export function toUserProfileRequired(user: UserDoc): UserProfile {
  const profile = toUserProfile(user);
  if (!profile) throw new Error('Failed to map user profile');
  return profile;
}
