import { Router } from 'express'

import {
  createStage,
  deleteStage,
  editStageDescription,
  editStageName,
  getStageById,
  getStages,
  moveStage,
} from '../controllers/stage.controller'

const stageRouter = Router()

stageRouter.get('/periodizations/:periodizationId/stages', getStages)

stageRouter.get('/periodizations/:periodizationId/stages/:stageId', getStageById)

stageRouter.post('/periodizations/:periodizationId/stages', createStage)

stageRouter.patch('/periodizations/:periodizationId/stages/:stageId/name', editStageName)

stageRouter.patch(
  '/periodizations/:periodizationId/stages/:stageId/description',
  editStageDescription,
)

stageRouter.patch('/periodizations/:periodizationId/stages/move', moveStage)

stageRouter.delete('/periodizations/:periodizationId/stages/:stageId', deleteStage)

export { stageRouter }
