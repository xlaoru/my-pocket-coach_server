import { Router } from "express";

import { createExercise, editExerciseName, addExerciseSet, editExerciseSet, removeExerciseSet, moveExercise, deleteExercise, } from "../controllers/exercise.contoller";
import { isAuth } from "../middleware/is-auth.middleware";

const exerciseRouter = Router();

exerciseRouter.post("/programs/:programId/exercises", isAuth, createExercise);

exerciseRouter.patch("/programs/:programId/exercises/:exerciseId", isAuth, editExerciseName);

exerciseRouter.post("/programs/:programId/exercises/:exerciseId/sets", isAuth, addExerciseSet);

exerciseRouter.patch("/programs/:programId/exercises/:exerciseId/sets/:setIndex", isAuth, editExerciseSet);

exerciseRouter.delete("/programs/:programId/exercises/:exerciseId/sets/:setIndex", isAuth, removeExerciseSet);

exerciseRouter.patch("/programs/:programId/workout/move", isAuth, moveExercise)

exerciseRouter.delete("/programs/:programId/exercises/:exerciseId", isAuth, deleteExercise);

export {
    exerciseRouter
}