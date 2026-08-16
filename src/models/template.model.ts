import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  templateWorkout: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TemplateWorkoutItem',
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

export const Template = mongoose.model('Template', templateSchema)
