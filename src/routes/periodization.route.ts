import { Router } from 'express'

import {
  createPeriodization,
  deletePeriodization,
  editPeriodizationDescription,
  editPeriodizationName,
  getPeriodizationById,
  getPeriodizations,
} from '../controllers/periodization.controller'

const periodizationRouter = Router()

periodizationRouter.get('/periodizations', getPeriodizations)

periodizationRouter.get('/periodizations/:id', getPeriodizationById)

periodizationRouter.post('/periodizations', createPeriodization)

periodizationRouter.patch('/periodizations/:id/name', editPeriodizationName)

periodizationRouter.patch('/periodizations/:id/description', editPeriodizationDescription)

periodizationRouter.delete('/periodizations/:id', deletePeriodization)

export { periodizationRouter }
