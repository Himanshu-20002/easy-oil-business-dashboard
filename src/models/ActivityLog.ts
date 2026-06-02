import { Schema, model, models } from 'mongoose';

const ActivityLogSchema = new Schema(
  {
    action: { type: String, required: true }, // e.g. 'Register', 'Submit Application', 'Verify Document', 'Approve'
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed } // e.g. { applicationId, documentId }
  },
  { timestamps: true }
);

export const ActivityLog = models.ActivityLog || model('ActivityLog', ActivityLogSchema);
