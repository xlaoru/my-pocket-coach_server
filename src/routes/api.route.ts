import { Router } from "express"

import { exerciseRouter } from "./exercise.route"
import { programRouter } from "./program.route"
import { supersetRouter } from "./superset.route"

const apiRouter = Router()

apiRouter.use(programRouter)
apiRouter.use(exerciseRouter)
apiRouter.use(supersetRouter)

export { apiRouter }