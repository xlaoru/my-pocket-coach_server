import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
  name: String,
  sets: {
    type: Number,
    default: 0,
  },
})

export const TemplateExercise = mongoose.model('TemplateExercise', templateSchema)
