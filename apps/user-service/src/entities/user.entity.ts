import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string; // This will be the ID from auth-service

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

  @Prop()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };

  @Prop()
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for better performance
UserSchema.index({ userId: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ firstName: 1, lastName: 1 });