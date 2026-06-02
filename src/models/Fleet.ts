import { Schema, model, models } from 'mongoose';

const FleetSchema = new Schema(
  {
    transporterRef: { type: Schema.Types.ObjectId, ref: 'Transporter', required: true, index: true },
    vehicleNumber: { type: String, required: true, unique: true, index: true },
    vehicleType: { type: String, required: true }, // e.g., 'Tanker Truck', 'Trailer'
    capacityKl: { type: Number, required: true },  // Capacity in Kilolitres
    driverName: { type: String, required: true },
    driverMobile: { type: String, required: true },
    driverLicenseNumber: { type: String, required: true },
    gpsEnabled: { type: Boolean, default: true },
    insuranceExpiry: { type: Date },
    pollutionExpiry: { type: Date },
    fitnessExpiry: { type: Date },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'ON_TRIP'],
      default: 'ACTIVE',
      index: true
    }
  },
  { timestamps: true }
);

export const Fleet = models.Fleet || model('Fleet', FleetSchema);
