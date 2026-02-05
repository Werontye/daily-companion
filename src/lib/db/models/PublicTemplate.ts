import mongoose from 'mongoose'

const taskTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: Number },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
})

const publicTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, maxLength: 500 },
  category: { type: String, required: true },
  icon: { type: String, default: '📋' },
  color: { type: String, default: 'blue' },
  tasks: [taskTemplateSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usageCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikesCount: { type: Number, default: 0 },
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String }],
  isApproved: { type: Boolean, default: true }, // For moderation if needed
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Index for efficient querying
publicTemplateSchema.index({ category: 1, usageCount: -1 })
publicTemplateSchema.index({ tags: 1 })
publicTemplateSchema.index({ author: 1 })
publicTemplateSchema.index({ createdAt: -1 })

export const PublicTemplate = mongoose.models.PublicTemplate ||
  mongoose.model('PublicTemplate', publicTemplateSchema)
