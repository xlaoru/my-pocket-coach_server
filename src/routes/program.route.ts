import { Router } from "express";
const programRouter = Router();

import { getPrograms, createProgram, getProgramById, editProgram, deleteProgram, createExercise } from "../controllers/program.controller";

programRouter.get("/programs", getPrograms);

programRouter.get("/programs/:id", getProgramById);

programRouter.post("/programs", createProgram);

programRouter.put("/programs/:id", editProgram);

programRouter.delete("/programs/:id", deleteProgram);

programRouter.post("/programs/:id/exercises", createExercise);

export {
    programRouter
}