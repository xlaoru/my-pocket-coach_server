import { Router } from "express";
const programRouter = Router();

import { getPrograms, createProgram, getProgramById } from "../controllers/program.controller";

programRouter.get("/programs", getPrograms);

programRouter.get("/programs/:id", getProgramById);

programRouter.post("/programs", createProgram);

export {
    programRouter
}