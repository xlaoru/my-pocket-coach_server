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
})

export const Template = mongoose.model('Template', templateSchema)
