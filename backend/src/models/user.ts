import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError, Types } from "mongoose";
import bcrypt from "bcryptjs";



export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  clerkId?: string;
  role: "user" | "admin";
  comparePassword(candidate: string): Promise<boolean>;
}
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    // Not required: users created via Clerk don't have a local password
    password: { type: String, select: false },
    // Set only for users authenticated via Clerk
    clerkId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (
  this: IUser,
  next: CallbackWithoutResultAndOptionalError
) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>("User", userSchema);