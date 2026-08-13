import { Router } from 'express'

import {
  createProgram,
  deleteProgram,
  editProgram,
  generateProgram,
  getProgramById,
  getPrograms,
  linkStage,
  unlinkStage,
} from '../controllers/program.controller'

const programRouter = Router()

programRouter.get('/programs', getPrograms)

programRouter.get('/programs/:id', getProgramById)

programRouter.post('/programs', createProgram)

programRouter.put('/programs/:id', editProgram)

programRouter.delete('/programs/:id', deleteProgram)

programRouter.patch(
  '/programs/:programId/periodizations/:periodizationId/stages/:stageId/link',
  linkStage,
)

programRouter.patch(
  '/programs/:programId/periodizations/:periodizationId/stages/:stageId/unlink',
  unlinkStage,
)

programRouter.post('/templates/:templateId/generate', generateProgram)

export { programRouter }
