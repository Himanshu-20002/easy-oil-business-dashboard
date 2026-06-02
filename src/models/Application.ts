import { Schema, model, models } from 'mongoose';

const RemarkSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ApplicationSchema = new Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true }, // e.g. IOCL-2026-10001
    companyRef: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    productType: { type: String, enum: ['LDO', 'HSD', 'Bitumen'], required: false },
    quantity: { type: Number, required: false },
    location: { type: String, required: false },
    storageAvailability: { type: Boolean, default: false },
    existingSupplier: { type: String, default: '' },
    requirementStartDate: { type: Date, required: false },
    leadSource: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['draft', 'submitted', 'under_review', 'correction_required', 'approved', 'rejected'], 
      default: 'draft',
      index: true 
    },
    assignedOfficer: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    remarks: [RemarkSchema]
  },
  { timestamps: true }
);

if (models.Application) {
  delete models.Application;
}

export const Application = model('Application', ApplicationSchema);
