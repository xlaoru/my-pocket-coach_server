import { Router } from "express";
const programRouter = Router();

import { getPrograms, createProgram, getProgramById, editProgram, deleteProgram, createExercise, editExerciseName, addExerciseSet, editExerciseSet, removeExerciseSet, deleteExercise } from "../controllers/program.controller";

programRouter.get("/programs", getPrograms);

programRouter.get("/programs/:id", getProgramById);

programRouter.post("/programs", createProgram);

programRouter.put("/programs/:id", editProgram);

programRouter.delete("/programs/:id", deleteProgram);

programRouter.post("/programs/:programId/exercises", createExercise);

programRouter.patch("/programs/:programId/exercises/:exerciseId", editExerciseName);

programRouter.post("/programs/:programId/exercises/:exerciseId/sets", addExerciseSet);

programRouter.patch("/programs/:programId/exercises/:exerciseId/sets/:setIndex", editExerciseSet);

programRouter.delete("/programs/:programId/exercises/:exerciseId/sets/:setIndex", removeExerciseSet);

programRouter.delete("/programs/:programId/exercises/:exerciseId", deleteExercise);

export {
    programRouter
}