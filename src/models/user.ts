import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { RoleEnum, statusEnum } from '../typescript/commonenum';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role?: RoleEnum.ADMIN | RoleEnum.USER;
  bio?: string;
  fcmToken?: string; // single device FCM token
  profilePicture?: string;
  resetPasswordToken?: string;   // for password reset
  resetPasswordExpires?: number; // timestamp
  activeToken?: string;  
  refreshToken?: string;          // for single-session JWT
  interests: Types.ObjectId[];
  status:statusEnum.ACTIVE | statusEnum.INACTIVE 
}

export interface IUserDoc extends IUser, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDoc>({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
  },
  password: { type: String, required: true, select: false },
  profilePicture: { type: String },
  bio: { type: String, maxlength: 200 },
  fcmToken: { type: String }, // only one device
  role: { type: String, enum: [RoleEnum.ADMIN, RoleEnum.USER], default: RoleEnum.USER },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Number, select: false },
  activeToken: { type: String, select: false },
  refreshToken: { type: String, select: false }, // single-session JWT
  status:{
    type:String,
    enum:[statusEnum.ACTIVE,statusEnum.INACTIVE],
     default:statusEnum.ACTIVE},
 // single-session JWT
  interests: {
  type: [Schema.Types.ObjectId],
  ref: 'Interests',  // Applies to each ID inside the array
  default: []
}

}, { timestamps: true });

// Hash password before saving
userSchema.pre<IUserDoc>('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = function(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUserDoc>('User', userSchema);
