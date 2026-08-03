import mongoose from 'mongoose'

const stageSchema = new mongoose.Schema({
  name: String,
  description: String,
  periodizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Periodization',
  },
})

export const Stage = mongoose.model('Stage', stageSchema)
