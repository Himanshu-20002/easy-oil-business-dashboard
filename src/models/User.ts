import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    mobile: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['customer', 'sales_officer', 'admin', 'transporter'], 
      default: 'customer' 
    },
    password: { type: String, required: true }, // Hashed
    companyRef: { type: Schema.Types.ObjectId, ref: 'Company', default: null },
    transporterRef: { type: Schema.Types.ObjectId, ref: 'Transporter', default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

if (models.User) {
  delete (models as any).User;
}

export const User = model('User', UserSchema);
