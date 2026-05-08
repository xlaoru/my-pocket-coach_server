import { Router } from "express";
const programRouter = Router();

import { getPrograms, createProgram, getProgramById, editProgram, deleteProgram, createExercise, editExerciseName, addExerciseSet, editExerciseSet, removeExerciseSet, moveExercise, deleteExercise, createSuperset, editSupersetName, unlinkAllSupersetExercises, deleteSuperset, unlinkCurrentSupersetExercises, linkCurrentSupersetExercises, addNewExerciseInsideSuperset } from "../controllers/program.controller";

programRouter.get("/programs", getPrograms);

programRouter.get("/programs/:id", getProgramById);

programRouter.post("/programs", createProgram);

programRouter.put("/programs/:id", editProgram);

programRouter.patch("/programs/:programId/workout/move", moveExercise)

programRouter.delete("/programs/:id", deleteProgram);

programRouter.post("/programs/:programId/exercises", createExercise);

programRouter.patch("/programs/:programId/exercises/:exerciseId", editExerciseName);

programRouter.post("/programs/:programId/exercises/:exerciseId/sets", addExerciseSet);

programRouter.patch("/programs/:programId/exercises/:exerciseId/sets/:setIndex", editExerciseSet);

programRouter.delete("/programs/:programId/exercises/:exerciseId/sets/:setIndex", removeExerciseSet);

programRouter.delete("/programs/:programId/exercises/:exerciseId", deleteExercise);

programRouter.post("/programs/:programId/supersets", createSuperset);

programRouter.patch("/programs/:programId/supersets/:supersetId", editSupersetName)

programRouter.post("/programs/:programId/supersets/:supersetId", addNewExerciseInsideSuperset)

programRouter.delete("/programs/:programId/supersets/:supersetId/unlink", unlinkAllSupersetExercises)

programRouter.delete("/programs/:programId/supersets/:supersetId", deleteSuperset)

programRouter.post("/programs/:programId/supersets/:supersetId/exercises/:exerciseId/link", linkCurrentSupersetExercises)

programRouter.delete("/programs/:programId/supersets/:supersetId/exercises/:exerciseId/unlink", unlinkCurrentSupersetExercises)

export {
    programRouter
}