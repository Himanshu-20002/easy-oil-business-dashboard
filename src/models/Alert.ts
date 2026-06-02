import { Schema, model, models } from 'mongoose';

const AlertSchema = new Schema(
  {
    companyRef: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['price_alert', 'consumption_alert', 'invoice_alert', 'credit_alert'] 
    },
    message: { type: String, required: true },
    priority: { 
      type: String, 
      required: true, 
      enum: ['info', 'warning', 'success', 'error'] 
    },
    timestamp: { type: Date, default: Date.now },
    dismissed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Alert = models.Alert || model('Alert', AlertSchema);
