import { Router } from "express";

import { createSuperset, editSupersetName, linkCurrentSupersetExercises, unlinkCurrentSupersetExercises, addNewExerciseInsideSuperset, unlinkAllSupersetExercises, deleteSuperset } from "../controllers/superset.controller";

const supersetRouter = Router();

supersetRouter.post("/programs/:programId/supersets", createSuperset);

supersetRouter.patch("/programs/:programId/supersets/:supersetId", editSupersetName)

supersetRouter.post("/programs/:programId/supersets/:supersetId/exercises/:exerciseId/link", linkCurrentSupersetExercises)

supersetRouter.delete("/programs/:programId/supersets/:supersetId/exercises/:exerciseId/unlink", unlinkCurrentSupersetExercises)

supersetRouter.post("/programs/:programId/supersets/:supersetId", addNewExerciseInsideSuperset)

supersetRouter.delete("/programs/:programId/supersets/:supersetId/unlink", unlinkAllSupersetExercises)

supersetRouter.delete("/programs/:programId/supersets/:supersetId", deleteSuperset)

export {
    supersetRouter
}