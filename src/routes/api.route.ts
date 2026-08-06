import { Router } from 'express'

import { exerciseRouter } from './exercise.route'
import { periodizationRouter } from './periodization.route'
import { programRouter } from './program.route'
import { stageRouter } from './stage.route'
import { supersetRouter } from './superset.route'
import { templateRouter } from './template.route'

const apiRouter = Router()

apiRouter.use(programRouter)
apiRouter.use(exerciseRouter)
apiRouter.use(supersetRouter)
apiRouter.use(periodizationRouter)
apiRouter.use(stageRouter)
apiRouter.use(templateRouter)

export { apiRouter }
