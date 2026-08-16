import { Router } from 'express'

import { authRouter } from './auth.route'
import { exerciseRouter } from './exercise.route'
import { periodizationRouter } from './periodization.route'
import { programRouter } from './program.route'
import { stageRouter } from './stage.route'
import { supersetRouter } from './superset.route'
import { templateRouter } from './template.route'
import { templateExerciseRoute } from './templateExercise.route'
import { templateSupersetRouter } from './templateSuperset.route'

const apiRouter = Router()

apiRouter.use(programRouter)
apiRouter.use(exerciseRouter)
apiRouter.use(supersetRouter)
apiRouter.use(periodizationRouter)
apiRouter.use(stageRouter)
apiRouter.use(templateRouter)
apiRouter.use(templateExerciseRoute)
apiRouter.use(templateSupersetRouter)
apiRouter.use(authRouter)

export { apiRouter }
