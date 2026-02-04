import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface INotification extends Document {
  userId: Types.ObjectId
  title: string
  message: string
  type: 'achievement' | 'task' | 'system' | 'friend_request'
  read: boolean
  relatedId?: string
  actionTaken?: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['achievement', 'task', 'system', 'friend_request'],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedId: {
      type: String,
    },
    actionTaken: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for querying user notifications
notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, read: 1 })

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema)

export default Notification
