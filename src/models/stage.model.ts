import mongoose from 'mongoose'

const stageSchema = new mongoose.Schema({
  name: String,
  description: String,
})

export const Stage = mongoose.model('Stage', stageSchema)
