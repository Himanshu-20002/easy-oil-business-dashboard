import { Schema, model, models } from 'mongoose';

const CompanySchema = new Schema(
  {
    companyName: { type: String, required: true },
    firmType: { 
      type: String, 
      required: true, 
      enum: ['Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'LLP', 'Others'] 
    },
    gst: { type: String, required: true, unique: true, index: true },
    pan: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    contactPerson: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    creditLimit: { type: Number, default: 1000000 },
    availableCredit: { type: Number, default: 1000000 }
  },
  { timestamps: true }
);

export const Company = models.Company || model('Company', CompanySchema);
