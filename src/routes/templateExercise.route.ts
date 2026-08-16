import { Router } from 'express'
import {
  createExercise,
  deleteExercise,
  editExerciseName,
  editExerciseSet,
  moveExercise,
} from '../controllers/templateExercise.controller'
import { isAuth } from '../middleware/is-auth.middleware'

const templateExerciseRoute = Router()

templateExerciseRoute.post('/templates/:templateId/exercises', isAuth, createExercise)

templateExerciseRoute.patch(
  '/templates/:templateId/exercises/:exerciseId/name',
  isAuth,
  editExerciseName,
)

templateExerciseRoute.patch(
  '/templates/:templateId/exercises/:exerciseId/sets',
  isAuth,
  editExerciseSet,
)

templateExerciseRoute.patch('/templates/:templateId/templateWorkout/move', isAuth, moveExercise)

templateExerciseRoute.delete('/templates/:templateId/exercises/:exerciseId', isAuth, deleteExercise)

export { templateExerciseRoute }
