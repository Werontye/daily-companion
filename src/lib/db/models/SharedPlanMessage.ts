import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface ISharedPlanMessage extends Document {
  planId: Types.ObjectId
  sender: Types.ObjectId
  content: string
  createdAt: Date
}

const sharedPlanMessageSchema = new Schema<ISharedPlanMessage>(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'SharedPlan',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
)

// Index for fetching plan messages
sharedPlanMessageSchema.index({ planId: 1, createdAt: -1 })

const SharedPlanMessage: Model<ISharedPlanMessage> =
  mongoose.models.SharedPlanMessage ||
  mongoose.model<ISharedPlanMessage>('SharedPlanMessage', sharedPlanMessageSchema)

export default SharedPlanMessage
