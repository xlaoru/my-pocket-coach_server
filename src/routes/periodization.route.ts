import { Router } from 'express'

import {
  createPeriodization,
  deletePeriodization,
  editPeriodizationDescription,
  editPeriodizationName,
  getPeriodizationById,
  getPeriodizations,
} from '../controllers/periodization.controller'
import { isAuth } from '../middleware/is-auth.middleware'

const periodizationRouter = Router()

periodizationRouter.get('/periodizations', isAuth, getPeriodizations)

periodizationRouter.get('/periodizations/:id', isAuth, getPeriodizationById)

periodizationRouter.post('/periodizations', isAuth, createPeriodization)

periodizationRouter.patch('/periodizations/:id/name', isAuth, editPeriodizationName)

periodizationRouter.patch(
  '/periodizations/:id/description',
  isAuth,
  editPeriodizationDescription,
)

periodizationRouter.delete('/periodizations/:id', isAuth, deletePeriodization)

export { periodizationRouter }
