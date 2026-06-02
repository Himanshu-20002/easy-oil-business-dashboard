import { Schema, model, models } from 'mongoose';

const BookingTimelineSchema = new Schema(
  {
    bookingRef: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    status: { type: String, required: true },
    remarks: { type: String, default: '' },
    updatedBy: { type: String, required: true }
  },
  { timestamps: true }
);

export const BookingTimeline = models.BookingTimeline || model('BookingTimeline', BookingTimelineSchema);
