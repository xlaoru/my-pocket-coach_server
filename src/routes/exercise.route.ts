import { Router } from "express";

import { createExercise, editExerciseName, addExerciseSet, editExerciseSet, removeExerciseSet, moveExercise, deleteExercise, } from "../controllers/exercise.contoller";

const exerciseRouter = Router();

exerciseRouter.post("/programs/:programId/exercises", createExercise);

exerciseRouter.patch("/programs/:programId/exercises/:exerciseId", editExerciseName);

exerciseRouter.post("/programs/:programId/exercises/:exerciseId/sets", addExerciseSet);

exerciseRouter.patch("/programs/:programId/exercises/:exerciseId/sets/:setIndex", editExerciseSet);

exerciseRouter.delete("/programs/:programId/exercises/:exerciseId/sets/:setIndex", removeExerciseSet);

exerciseRouter.patch("/programs/:programId/workout/move", moveExercise)

exerciseRouter.delete("/programs/:programId/exercises/:exerciseId", deleteExercise);

export {
    exerciseRouter
}