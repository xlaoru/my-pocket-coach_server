import { Router } from 'express'
import {
  createTemplate,
  deleteTemplate,
  editTemplateDescription,
  editTemplateName,
  getTemplateById,
  getTemplates,
} from '../controllers/template.controller'
import { isAuth } from '../middleware/is-auth.middleware'

const templateRouter = Router()

templateRouter.get('/templates', isAuth, getTemplates)

templateRouter.get('/templates/:id', isAuth, getTemplateById)

templateRouter.post('/templates', isAuth, createTemplate)

templateRouter.patch('/templates/:id/name', isAuth, editTemplateName)

templateRouter.patch('/templates/:id/description', isAuth, editTemplateDescription)

templateRouter.delete('/templates/:id', isAuth, deleteTemplate)

export { templateRouter }
