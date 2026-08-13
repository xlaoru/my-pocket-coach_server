import mongoose from 'mongoose'

const templateWorkoutItem = new mongoose.Schema({
  type: {
    type: String,
    enum: ['exercise', 'superset'],
    required: true,
  },
  name: String,
  components: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TemplateExercise',
    },
  ],
})

export const TemplateWorkoutItem = mongoose.model('TemplateWorkoutItem', templateWorkoutItem)
