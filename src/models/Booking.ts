import { Schema, model, models } from 'mongoose';

const BookingSchema = new Schema(
  {
    requestRef: { type: Schema.Types.ObjectId, ref: 'TransportRequest', required: true, index: true },
    quoteRef: { type: Schema.Types.ObjectId, ref: 'Quote', required: true },
    companyRef: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    transporterRef: { type: Schema.Types.ObjectId, ref: 'Transporter', required: true, index: true },
    fleetRef: { type: Schema.Types.ObjectId, ref: 'Fleet', required: true },
    driverName: { type: String },
    driverMobile: { type: String },
    bookingAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    platformRevenue: { type: Number, required: true },
    status: {
      type: String,
      enum: ['BOOKED', 'VEHICLE_ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
      default: 'BOOKED',
      index: true
    }
  },
  { timestamps: true }
);

export const Booking = models.Booking || model('Booking', BookingSchema);
