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
    deliveryETA: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Order = models.Order || model('Order', OrderSchema);
