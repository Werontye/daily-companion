import mongoose, { Document, Model, Schema, Types } from 'mongoose'

export interface ISharedPlanMember {
  userId: Types.ObjectId
  role: 'owner' | 'editor' | 'viewer'
  joinedAt: Date
}

export interface ISharedPlanTask {
  _id: Types.ObjectId
  title: string
  description?: string
  assignedTo?: Types.ObjectId
  status: 'pending' | 'in-progress' | 'completed'
  createdBy: Types.ObjectId
  createdAt: Date
  completedAt?: Date
}

export interface ISharedPlan extends Document {
  name: string
  description?: string
  owner: Types.ObjectId
  members: ISharedPlanMember[]
  tasks: ISharedPlanTask[]
  createdAt: Date
  updatedAt: Date
}

const sharedPlanMemberSchema = new Schema<ISharedPlanMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const sharedPlanTaskSchema = new Schema<ISharedPlanTask>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  }
)

const sharedPlanSchema = new Schema<ISharedPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [sharedPlanMemberSchema],
    tasks: [sharedPlanTaskSchema],
  },
  { timestamps: true }
)

// Index for finding plans by member
sharedPlanSchema.index({ 'members.userId': 1 })

const SharedPlan: Model<ISharedPlan> =
  mongoose.models.SharedPlan || mongoose.model<ISharedPlan>('SharedPlan', sharedPlanSchema)

export default SharedPlan
