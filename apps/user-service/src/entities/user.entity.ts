import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define nested schema types
class Address {
  @Prop()
  street?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  country?: string;

  @Prop()
  zipCode?: string;
}

class NotificationSettings {
  @Prop()
  email?: boolean;

  @Prop()
  push?: boolean;

  @Prop()
  sms?: boolean;
}

class UserPreferences {
  @Prop()
  language?: string;

  @Prop()
  timezone?: string;

  @Prop({ type: NotificationSettings })
  notifications?: NotificationSettings;
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  authUserId: string; // This will be the ID from auth-service

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  profilePicture?: string;

  @Prop()
  bio?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: Address })
  address?: Address;

  @Prop({ type: UserPreferences })
  preferences?: UserPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for better performance (authUserId already has unique index from @Prop)
UserSchema.index({ isActive: 1 });
UserSchema.index({ firstName: 1, lastName: 1 });
