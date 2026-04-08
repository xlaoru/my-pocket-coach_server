import { Router } from "express";
const programRouter = Router();

import { getPrograms, createProgram } from "../controllers/program.controller";

programRouter.get("/programs", getPrograms);

programRouter.post("/programs", createProgram);

export {
    programRouter
}