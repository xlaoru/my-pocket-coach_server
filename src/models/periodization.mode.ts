import mongoose from 'mongoose'

const periodizationSchema = new mongoose.Schema({
  name: String,
  description: String,
  stages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stage',
    },
  ],
})

export const Periodization = mongoose.model('Periodization', periodizationSchema)
