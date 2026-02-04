import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IDirectMessage extends Document {
  conversationId: string
  sender: Types.ObjectId
  recipient: Types.ObjectId
  content: string
  read: boolean
  readAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface IDirectMessageModel extends Model<IDirectMessage> {
  getConversationId(userId1: string, userId2: string): string
}

const directMessageSchema = new Schema<IDirectMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

// Indexes for conversation queries
directMessageSchema.index({ conversationId: 1, createdAt: -1 })
directMessageSchema.index({ recipient: 1, read: 1 })

// Static helper to generate conversationId
directMessageSchema.statics.getConversationId = function(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_')
}

const DirectMessage: IDirectMessageModel =
  (mongoose.models.DirectMessage as IDirectMessageModel) ||
  mongoose.model<IDirectMessage, IDirectMessageModel>('DirectMessage', directMessageSchema)

export default DirectMessage
