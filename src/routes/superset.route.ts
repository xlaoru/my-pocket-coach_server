import { Router } from "express";

import { createSuperset, editSupersetName, linkCurrentSupersetExercises, unlinkCurrentSupersetExercises, addNewExerciseInsideSuperset, unlinkAllSupersetExercises, deleteSuperset } from "../controllers/superset.controller";
import { isAuth } from "../middleware/is-auth.middleware";

const supersetRouter = Router();

supersetRouter.post("/programs/:programId/supersets", isAuth, createSuperset);

supersetRouter.patch("/programs/:programId/supersets/:supersetId", isAuth, editSupersetName)

supersetRouter.post("/programs/:programId/supersets/:supersetId/exercises/:exerciseId/link", isAuth, linkCurrentSupersetExercises)

supersetRouter.delete("/programs/:programId/supersets/:supersetId/exercises/:exerciseId/unlink", isAuth, unlinkCurrentSupersetExercises)

supersetRouter.post("/programs/:programId/supersets/:supersetId", isAuth, addNewExerciseInsideSuperset)

supersetRouter.delete("/programs/:programId/supersets/:supersetId/unlink", isAuth, unlinkAllSupersetExercises)

supersetRouter.delete("/programs/:programId/supersets/:supersetId", isAuth, deleteSuperset)

export {
    supersetRouter
}