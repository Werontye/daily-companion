import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface ISharedPlanInvitation extends Document {
  planId: Types.ObjectId
  invitedBy: Types.ObjectId
  invitedUser: Types.ObjectId
  role: 'editor' | 'viewer'
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
  updatedAt: Date
}

const sharedPlanInvitationSchema = new Schema<ISharedPlanInvitation>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'SharedPlan',
      required: true,
      index: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
)

// Ensure unique pending invitation per user per plan
sharedPlanInvitationSchema.index(
  { planId: 1, invitedUser: 1 },
  { unique: true }
)

const SharedPlanInvitation: Model<ISharedPlanInvitation> =
  mongoose.models.SharedPlanInvitation ||
  mongoose.model<ISharedPlanInvitation>('SharedPlanInvitation', sharedPlanInvitationSchema)

export default SharedPlanInvitation
