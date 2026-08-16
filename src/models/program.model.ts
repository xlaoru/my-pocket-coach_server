import mongoose from 'mongoose'

const programSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: String,
  description: String,
  date: Date,
  workout: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutItem',
    },
  ],
  periodizationStage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    default: null,
  },
})

export const Program = mongoose.model('Program', programSchema)
