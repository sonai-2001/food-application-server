import mongoose, { Document, Schema, Types } from "mongoose";

//* tell the ts , what a use document will look like ...
export interface IUser extends Document {
  _id: Types.ObjectId;
  userName?: string;
  ownerName?: string;
  resturentName?: string;
  email: string;
  password: string;
  isVerified: boolean;
  role: "admin" | "seller" | "user";
}

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: function (this: IUser): boolean {
        return this.role !== "seller";
      },
      unique: true,
      sparse: true,
    },

    ownerName: {
      type: String,
      required: function (this: IUser): boolean {
        return this.role === "seller";
      },
      unique: true,
      sparse: true,
    },

    resturentName: {
      type: String,
      required: function (this: IUser): boolean {
        return this.role === "seller";
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["admin", "seller", "user"],
      required: true,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
