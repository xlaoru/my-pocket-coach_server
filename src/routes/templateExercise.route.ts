import { Router } from 'express'
import {
  createExercise,
  deleteExercise,
  editExerciseName,
  editExerciseSet,
  moveExercise,
} from '../controllers/templateExercise.controller'

const templateExerciseRoute = Router()

templateExerciseRoute.post('/templates/:templateId/exercises', createExercise)

templateExerciseRoute.patch('/templates/:templateId/exercises/:exerciseId/name', editExerciseName)

templateExerciseRoute.patch('/templates/:templateId/exercises/:exerciseId/sets', editExerciseSet)

templateExerciseRoute.patch('/templates/:templateId/templateWorkout/move', moveExercise)

templateExerciseRoute.delete('/templates/:templateId/exercises/:exerciseId', deleteExercise)

export { templateExerciseRoute }
