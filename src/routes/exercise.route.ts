import { Router } from 'express'

import {
  addExerciseSet,
  createExercise,
  deleteExercise,
  editExerciseName,
  editExerciseSet,
  moveExercise,
  removeExerciseSet,
  setExerciseNote,
} from '../controllers/exercise.controller'
import { isAuth } from '../middleware/is-auth.middleware'

const exerciseRouter = Router()

exerciseRouter.post('/programs/:programId/exercises', isAuth, createExercise)

exerciseRouter.patch('/programs/:programId/exercises/:exerciseId', isAuth, editExerciseName)

exerciseRouter.post('/programs/:programId/exercises/:exerciseId/sets', isAuth, addExerciseSet)

exerciseRouter.patch(
  '/programs/:programId/exercises/:exerciseId/sets/:setIndex',
  isAuth,
  editExerciseSet,
)

exerciseRouter.delete(
  '/programs/:programId/exercises/:exerciseId/sets/:setIndex',
  isAuth,
  removeExerciseSet,
)

exerciseRouter.patch('/programs/:programId/workout/move', isAuth, moveExercise)

exerciseRouter.delete('/programs/:programId/exercises/:exerciseId', isAuth, deleteExercise)

exerciseRouter.patch('/programs/:programId/exercises/:exerciseId/note', isAuth, setExerciseNote)

export { exerciseRouter }
