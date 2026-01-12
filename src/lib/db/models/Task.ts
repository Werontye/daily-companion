import mongoose, { Document, Model, Schema, Types, CallbackError } from 'mongoose'

export interface ITask extends Document {
  userId: Types.ObjectId
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
  startTime?: Date
  endTime?: Date
  duration?: number // in minutes
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
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
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    startTime: {
      type: Date,
      index: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for user tasks queries
taskSchema.index({ userId: 1, startTime: -1 })
taskSchema.index({ userId: 1, status: 1 })
taskSchema.index({ userId: 1, createdAt: -1 })

// Automatically set completedAt when status changes to completed
taskSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date()
  }
})

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema)

export default Task
