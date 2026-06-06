import { Schema, model, models } from 'mongoose';

const TransportRequestSchema = new Schema(
  {
    companyRef: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    orderRef: { type: Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    fuelType: { type: String, required: true }, // e.g., 'HSD', 'LDO', 'Bitumen'
    quantityKl: { type: Number, required: true },
    requiredDate: { type: Date, required: true },
    specialInstructions: { type: String, default: '' },
    status: {
      type: String,
      enum: ['REQUEST_CREATED', 'OPEN_FOR_BIDDING', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REQUEST_CREATED',
      index: true
    },
    selectedQuoteRef: { type: Schema.Types.ObjectId, ref: 'Quote', default: null }
  },
  { timestamps: true }
);

if (models.TransportRequest) {
  delete (models as any).TransportRequest;
}

export const TransportRequest = model('TransportRequest', TransportRequestSchema);

