import { Request, Response } from "express";
import { Program } from "../models/program.model";

async function getPrograms(req: Request, res: Response) {
    try {
        const programs = await Program.find();
        res.status(200).json(programs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch programs" });
    }
}

async function createProgram(req: Request, res: Response) {
    try {
        const { name, description, workout } = req.body;

        const newProgram = new Program({
            name,
            description,
            workout
        });
        
        const savedProgram = await newProgram.save();
        
        res.status(201).json(savedProgram);
    } catch (error) {
        res.status(500).json({ message: "Failed to create program" });
    }
}

export {
    getPrograms,
    createProgram
}