import mongoose from 'mongoose'

const templateSchema = new mongoose.Schema({
  name: String,
  sets: Number,
})

export const TemplateExercise = mongoose.model('TemplateExercise', templateSchema)
