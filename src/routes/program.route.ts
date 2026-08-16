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
import { isAuth } from '../middleware/is-auth.middleware'

const programRouter = Router()

programRouter.get('/programs', isAuth, getPrograms)

programRouter.get('/programs/:id', isAuth, getProgramById)

programRouter.post('/programs', isAuth, createProgram)

programRouter.put('/programs/:id', isAuth, editProgram)

programRouter.delete('/programs/:id', isAuth, deleteProgram)

programRouter.patch(
  '/programs/:programId/periodizations/:periodizationId/stages/:stageId/link',
  isAuth,
  linkStage,
)

programRouter.patch(
  '/programs/:programId/periodizations/:periodizationId/stages/:stageId/unlink',
  isAuth,
  unlinkStage,
)

programRouter.post('/templates/:templateId/generate', isAuth, generateProgram)

export { programRouter }
