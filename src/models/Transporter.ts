import { Schema, model, models } from 'mongoose';

const TransporterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    companyName: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    gstNumber: { type: String, required: false, index: true },
    address: { type: String, required: false },
    serviceArea: { type: String, required: true },
    vehicleCapacity: { type: Number, required: true }, // in KL
    rating: { type: Number, default: 5.0 },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING_APPROVAL',
      index: true
    },
    // Backwards compatibility fields
    serviceRegions: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true
    },
    completedDeliveries: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  { timestamps: true }
);

if (models.Transporter) {
  delete (models as any).Transporter;
}

export const Transporter = model('Transporter', TransporterSchema);
