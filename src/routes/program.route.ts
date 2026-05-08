import { Router } from "express";

import { getPrograms, getProgramById, createProgram, editProgram, deleteProgram, } from "../controllers/program.controller";

const programRouter = Router();

programRouter.get("/programs", getPrograms);

programRouter.get("/programs/:id", getProgramById);

programRouter.post("/programs", createProgram);

programRouter.put("/programs/:id", editProgram);

programRouter.delete("/programs/:id", deleteProgram);

export {
    programRouter
}