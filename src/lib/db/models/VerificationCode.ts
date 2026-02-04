import mongoose from 'mongoose'

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['registration', 'password-reset'],
    default: 'registration',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for efficient lookups
verificationCodeSchema.index({ email: 1, type: 1 })
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const VerificationCode = mongoose.models.VerificationCode ||
  mongoose.model('VerificationCode', verificationCodeSchema)
