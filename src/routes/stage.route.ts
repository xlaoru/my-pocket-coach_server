import { Router } from 'express'

import {
  createStage,
  deleteStage,
  editStageDescription,
  editStageName,
  moveStage,
} from '../controllers/stage.controller'
import { isAuth } from '../middleware/is-auth.middleware'

const stageRouter = Router()

stageRouter.post('/periodizations/:periodizationId/stages', isAuth, createStage)

stageRouter.patch('/periodizations/:periodizationId/stages/:stageId/name', isAuth, editStageName)

stageRouter.patch(
  '/periodizations/:periodizationId/stages/:stageId/description',
  isAuth,
  editStageDescription,
)

stageRouter.patch('/periodizations/:periodizationId/stages/move', isAuth, moveStage)

stageRouter.delete('/periodizations/:periodizationId/stages/:stageId', isAuth, deleteStage)

export { stageRouter }
