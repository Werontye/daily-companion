import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface IFriendship extends Document {
  requester: Types.ObjectId
  recipient: Types.ObjectId
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  createdAt: Date
  updatedAt: Date
}

const friendshipSchema = new Schema<IFriendship>(
  {
    requester: {
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
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'blocked'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
)

// Compound indexes for efficient queries
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true })
friendshipSchema.index({ recipient: 1, status: 1 })
friendshipSchema.index({ requester: 1, status: 1 })

const Friendship: Model<IFriendship> =
  mongoose.models.Friendship || mongoose.model<IFriendship>('Friendship', friendshipSchema)

export default Friendship
