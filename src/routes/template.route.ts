import { Router } from 'express'
import {
  createTemplate,
  deleteTemplate,
  editTemplateDescription,
  editTemplateName,
  getTemplateById,
  getTemplates,
} from '../controllers/template.controller'

const templateRouter = Router()

templateRouter.get('/templates', getTemplates)

templateRouter.get('/templates/:id', getTemplateById)

templateRouter.post('/templates', createTemplate)

templateRouter.patch('/templates/:id/name', editTemplateName)

templateRouter.patch('/templates/:id/description', editTemplateDescription)

templateRouter.delete('/templates/:id', deleteTemplate)

export { templateRouter }
