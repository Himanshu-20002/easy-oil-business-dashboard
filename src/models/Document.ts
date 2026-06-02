import { Schema, model, models } from 'mongoose';

const DocumentSchema = new Schema(
  {
    applicationRef: { type: Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    fileType: { 
      type: String, 
      enum: ['request_letter', 'gst_certificate', 'pan_card', 'incorporation_cert', 'auth_letter', 'supporting_doc'], 
      required: true 
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    verificationStatus: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected'], 
      default: 'pending' 
    },
    comments: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Document = models.Document || model('Document', DocumentSchema);
