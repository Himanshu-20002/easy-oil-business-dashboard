import { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema(
  {
    companyRef: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    product: { type: String, required: true, enum: ['HSD', 'LDO', 'Bitumen'] },
    quantity: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['processing', 'in_transit', 'delivered'], 
      default: 'processing' 
    },
    transportStatus: {
      type: String,
      enum: ['AWAITING_TRANSPORT', 'BIDDING', 'TRANSPORT_BOOKED', 'IN_TRANSIT', 'DELIVERED'],
      default: 'AWAITING_TRANSPORT',
      index: true
    },
    bookingRef: { type: Schema.Types.ObjectId, ref: 'Booking', default: null, index: true },
    transportRequestRef: { type: Schema.Types.ObjectId, ref: 'TransportRequest', default: null, index: true },
    deliveryETA: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

if (models.Order) {
  delete (models as any).Order;
}

export const Order = model('Order', OrderSchema);

