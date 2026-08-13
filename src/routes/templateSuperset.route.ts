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

const templateSupersetRouter = Router()

templateSupersetRouter.post('/templates/:templateId/supersets', createSuperset)

templateSupersetRouter.patch('/templates/:templateId/supersets/:supersetId', editSupersetName)

templateSupersetRouter.delete('/templates/:templateId/supersets/:supersetId', deleteSuperset)

templateSupersetRouter.delete(
  '/templates/:templateId/supersets/:supersetId/unlink',
  unlinkAllSupersetExercises,
)

templateSupersetRouter.post(
  '/templates/:templateId/supersets/:supersetId',
  addNewExerciseInsideSuperset,
)

templateSupersetRouter.delete(
  '/templates/:templateId/supersets/:supersetId/exercises/:exerciseId/unlink',
  unlinkCurrentSupersetExercises,
)

templateSupersetRouter.post(
  '/templates/:templateId/supersets/:supersetId/exercises/:exerciseId/link',
  linkCurrentSupersetExercises,
)

export { templateSupersetRouter }
