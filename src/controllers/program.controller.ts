import { Request, Response } from "express";
import { Program } from "../models/program.model";
import "../models/workoutItem.model";
import "../models/exercise.model";
import { Exercise } from "../models/exercise.model";
import { WorkoutItem } from "../models/workoutItem.model";

async function getPrograms(req: Request, res: Response) {
    try {
        const programs = await Program.find()
            .populate({
                path: "workout",
                populate: {
                    path: "components",
                },
            });

        res.status(200).json(programs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch programs" });
    }
}

async function getProgramById(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const program = await Program.findById(id)
            .populate({
                path: "workout",
                populate: {
                    path: "components",
                }
            })
        
        res.status(200).json(program);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch program" });
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

async function editProgram(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const { name, description = "" } = req.body;

        const program = await Program.findById(id);

        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        program.name = name || program.name;
        program.description = description || program.description;

        const updatedProgram = await program.save();

        res.status(200).json(updatedProgram);
    } catch (error) {
        res.status(500).json({ message: "Failed to update program" });
    }
}

async function deleteProgram(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const program = await Program.findById(id).populate("workout");

        if (!program) {
        return res.status(404).json({ message: "Program not found" });
        }

        const exerciseIds = program.workout.flatMap((item: any) => item.components);

        const workoutItemIds = program.workout.map((item: any) => item._id ?? item)

        await Exercise.deleteMany({ _id: { $in: exerciseIds } });

        await WorkoutItem.deleteMany({ _id: { $in: workoutItemIds } });
        
        await Program.findByIdAndDelete(id);

        res.status(200).json({ message: "Program deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete program" });
    }
}

async function createExercise(req: Request, res: Response) {
    try {
        const { programId } = req.params;

        const { name, sets } = req.body;

        const program = await Program.findById(programId);
        
        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        const newExercise = new Exercise({
            name,
            sets
        })

        const savedExercise = await newExercise.save();

        const newWorkoutItem = new WorkoutItem({
            type: "exercise",
            name,
            components: [savedExercise._id],
        })

        const savedWorkoutItem = await newWorkoutItem.save();

        program.workout.push(savedWorkoutItem._id);
        
        await program.save();

        res.status(201).json(savedExercise);
    } catch (error) {
        res.status(500).json({ message: "Failed to create exercise" });
    }
}

async function editExerciseName(req: Request, res: Response) {
    try {
        const { programId, exerciseId } = req.params;

        const { name } = req.body;

        const program = await Program.findById(programId).populate("workout");

        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        const workoutItem = program.workout.find((item: any) => item.components.includes(exerciseId));

        if (!workoutItem) {
            return res.status(404).json({ message: "Exercise not found in program" });
        }

        const exercise = await Exercise.findById(exerciseId);

        if (!exercise) {
            return res.status(404).json({ message: "Exercise not found" });
        }

        exercise.name = name || exercise.name;

        const updatedExercise = await exercise.save();

        (workoutItem as any).name = name || (workoutItem as any).name;

        await (workoutItem as any).save();

        res.status(200).json(updatedExercise);
    } catch (error) {
        res.status(500).json({ message: "Failed to edit exercise" });
    }
}

async function deleteExercise(req: Request, res: Response) {
    try {
        const { programId, exerciseId } = req.params;

        const program = await Program.findById(programId).populate("workout");

        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        const workoutItem = program.workout.find((item: any) => item.components.includes(exerciseId));

        if (!workoutItem) {
            return res.status(404).json({ message: "Exercise not found in program" });
        }

        await Exercise.findByIdAndDelete(exerciseId);

        if ((workoutItem as any).type === "superset") {
            (workoutItem as any).components = (workoutItem as any).components.filter((component: any) => component.toString() !== exerciseId);

            if ((workoutItem as any).components.length === 0) {
                program.workout = program.workout.filter((item: any) => item._id.toString() !== workoutItem._id.toString());
                await WorkoutItem.findByIdAndDelete(workoutItem._id);
            } else {
                await (workoutItem as any).save();
            }
        } else {
            program.workout = program.workout.filter((item: any) => item._id.toString() !== workoutItem._id.toString());
            await WorkoutItem.findByIdAndDelete(workoutItem._id);
        }

        await program.save();

        res.status(200).json({ message: "Exercise deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete exercise" });
    }
}

export {
    getPrograms,
    getProgramById,
    createProgram,
    editProgram,
    deleteProgram,
    createExercise,
    editExerciseName,
    deleteExercise
}