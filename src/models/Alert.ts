import { Schema, model, models } from 'mongoose';

const AlertSchema = new Schema(
  {
    companyRef: { type: Schema.Types.ObjectId, ref: 'Company', required: false, index: true },
    isGlobal: { type: Boolean, default: false },
    type: { 
      type: String, 
      required: true, 
      enum: ['price_alert', 'consumption_alert', 'invoice_alert', 'credit_alert', 'broadcast'] 
    },
    message: { type: String, required: true },
    priority: { 
      type: String, 
      required: true, 
      enum: ['info', 'warning', 'success', 'error'] 
    },
    timestamp: { type: Date, default: Date.now },
    dismissed: { type: Boolean, default: false },
    dismissedBy: [{ type: Schema.Types.ObjectId, ref: 'Company' }]
  },
  { timestamps: true }
);

if (models.Alert) {
  delete (models as any).Alert;
}

export const Alert = model('Alert', AlertSchema);

