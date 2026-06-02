import { Schema, model, models } from 'mongoose';

const QuoteSchema = new Schema(
  {
    requestRef: { type: Schema.Types.ObjectId, ref: 'TransportRequest', required: true, index: true },
    transporterRef: { type: Schema.Types.ObjectId, ref: 'Transporter', required: true, index: true },
    fleetRef: { type: Schema.Types.ObjectId, ref: 'Fleet', required: true },
    quotedAmount: { type: Number, required: true },
    estimatedHours: { type: Number, required: true },
    remarks: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING',
      index: true
    }
  },
  { timestamps: true }
);

export const Quote = models.Quote || model('Quote', QuoteSchema);
