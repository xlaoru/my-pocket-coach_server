import { Router } from 'express'
import {
  addNewExerciseInsideSuperset,
  createSuperset,
  deleteSuperset,
  editSupersetName,
  linkCurrentSupersetExercises,
  unlinkAllSupersetExercises,
  unlinkCurrentSupersetExercises,
} from '../controllers/templateSuperset.controller'
import { isAuth } from '../middleware/is-auth.middleware'

const templateSupersetRouter = Router()

templateSupersetRouter.post('/templates/:templateId/supersets', isAuth, createSuperset)

templateSupersetRouter.patch(
  '/templates/:templateId/supersets/:supersetId',
  isAuth,
  editSupersetName,
)

templateSupersetRouter.delete('/templates/:templateId/supersets/:supersetId', isAuth, deleteSuperset)

templateSupersetRouter.delete(
  '/templates/:templateId/supersets/:supersetId/unlink',
  isAuth,
  unlinkAllSupersetExercises,
)

templateSupersetRouter.post(
  '/templates/:templateId/supersets/:supersetId',
  isAuth,
  addNewExerciseInsideSuperset,
)

templateSupersetRouter.delete(
  '/templates/:templateId/supersets/:supersetId/exercises/:exerciseId/unlink',
  isAuth,
  unlinkCurrentSupersetExercises,
)

templateSupersetRouter.post(
  '/templates/:templateId/supersets/:supersetId/exercises/:exerciseId/link',
  isAuth,
  linkCurrentSupersetExercises,
)

export { templateSupersetRouter }
