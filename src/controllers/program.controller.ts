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
        res.status(500).json({ message: "Failed to edit exercise name" });
    }
}

async function addExerciseSet(req: Request, res: Response) {
    try {
        const { programId, exerciseId } = req.params;

        const { weight, reps } = req.body;

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

        exercise.sets.push({ weight, reps });

        const updatedExercise = await exercise.save();

        res.status(200).json(updatedExercise);
    } catch (error) {
        res.status(500).json({ message: "Failed to add exercise set" });
    }
}

async function editExerciseSet(req: Request, res: Response) {
    try {
        const { programId, exerciseId, setIndex } = req.params;

        const { weight, reps } = req.body as { weight?: unknown; reps?: unknown };

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

        if (Number(setIndex) < 0 || Number(setIndex) >= exercise.sets.length) {
            return res.status(400).json({ message: "Invalid set index" });
        }

        const parsedSetIndex = Number(setIndex);
        const hasWeight = weight !== undefined;
        const hasReps = reps !== undefined;

        if (!hasWeight && !hasReps) {
            return res.status(400).json({ message: "At least one field is required: weight or reps" });
        }

        if (hasWeight && (typeof weight !== "number" || Number.isNaN(weight) || weight < 0)) {
            return res.status(400).json({ message: "Invalid weight" });
        }

        if (hasReps && (typeof reps !== "number" || Number.isNaN(reps) || reps < 0)) {
            return res.status(400).json({ message: "Invalid reps" });
        }

        const setToUpdate = exercise.sets[parsedSetIndex];

        if (!setToUpdate) {
            return res.status(400).json({ message: "Invalid set index" });
        }

        if (hasWeight) {
            setToUpdate.weight = weight;
        }

        if (hasReps) {
            setToUpdate.reps = reps;
        }

        const updatedExercise = await exercise.save();

        res.status(200).json(updatedExercise);
    } catch (error) {
        res.status(500).json({ message: "Failed to edit exercise set" });
    }
}

async function removeExerciseSet(req: Request, res: Response) {
    try {
        const { programId, exerciseId, setIndex } = req.params;

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

        if (Number(setIndex) < 0 || Number(setIndex) >= exercise.sets.length) {
            return res.status(400).json({ message: "Invalid set index" });
        }

        exercise.sets.splice(Number(setIndex), 1);

        const updatedExercise = await exercise.save();

        res.status(200).json(updatedExercise);
    } catch (error) {
        res.status(500).json({ message: "Failed to remove exercise set" });
    }
}

async function moveExercise(req: Request, res: Response) {
    try {
        const { programId } = req.params

        const { containerId, sourceIndex, destinationIndex } = req.body;

        const program = await Program.findById(programId).populate("workout");

        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        if (containerId === programId) {
            if (sourceIndex < 0 || sourceIndex >= program.workout.length || destinationIndex < 0 || destinationIndex >= program.workout.length) {
                return res.status(400).json({ message: "Invalid source or destination index" });
            }

            const workoutItem = program.workout[sourceIndex];

            if (!workoutItem) {
                return res.status(400).json({ message: "Invalid source index" });
            }

            program.workout.splice(sourceIndex, 1);

            program.workout.splice(destinationIndex, 0, workoutItem);

            await program.save();

            res.status(200).json({ message: "Exercise moved successfully" });
        } else {
            const superset = program.workout.find((item: any) => item._id.toString() === containerId);

            if (!superset) {
                return res.status(404).json({ message: "Superset not found" });
            }

            if ((superset as any).type !== "superset") {
                return res.status(400).json({ message: "Container is not a superset" });
            }

            if (sourceIndex < 0 || sourceIndex >= (superset as any).components.length || destinationIndex < 0 || destinationIndex >= (superset as any).components.length) {
                return res.status(400).json({ message: "Invalid source or destination index" });
            }

            const exerciseId = (superset as any).components[sourceIndex];

            if (!exerciseId) {
                return res.status(400).json({ message: "Invalid source index" });
            }

            (superset as any).components.splice(sourceIndex, 1);

            (superset as any).components.splice(destinationIndex, 0, exerciseId);

            await (superset as any).save();

            res.status(200).json({ message: "Exercise moved successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to move exercise" });
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

async function createSuperset(req: Request, res: Response) {
    try {
        const { programId } = req.params;

        const { name, workoutItemIds } = req.body;

        if (!Array.isArray(workoutItemIds) || workoutItemIds.length < 2) {
            return res.status(400).json({ message: "Select at least 2 exercises" });
        }

        const program = await Program.findById(programId)

        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        const selectedIds = workoutItemIds.map((itemId) => String(itemId));
        const programWorkoutIds = program.workout.map((item: any) => String(item));

        const hasUnknownItems = selectedIds.some((itemId) => !programWorkoutIds.includes(itemId));

        if (hasUnknownItems) {
            return res.status(400).json({ message: "Some selected items are not in this program" });
        }

        const workoutItems = await WorkoutItem.find({ _id: { $in: selectedIds } });
        
        if (workoutItems.length !== selectedIds.length) {
            return res.status(400).json({ message: "Some workout items were not found" });
        }

        const canGroup = workoutItems.every(
            (item) => item.type === "exercise" && item.components.length === 1
        );

        if (!canGroup) {
            return res.status(400).json({
                message: "Only single exercises can be grouped into a superset",
            });
        }

        const orderedSelection = program.workout
            .map((item: any, index: number) => ({ id: String(item), index }))
            .filter((entry: { id: string; index: number }) => selectedIds.includes(entry.id))
            .sort((a, b) => a.index - b.index);

        if (orderedSelection.length === 0) {
            return res.status(400).json({ message: "No valid workout items selected" });
        }

        const insertIndex = orderedSelection.at(0)?.index;

        if (insertIndex === undefined) {
            return res.status(400).json({ message: "No valid workout items selected" });
        }

        const exerciseIds = workoutItems
            .sort(
                (a, b) =>
                    selectedIds.indexOf(String(a._id)) - selectedIds.indexOf(String(b._id))
            )
            .map((item) => item.components[0]);

        const superset = new WorkoutItem({
            type: "superset",
            name: typeof name === "string" && name.trim() ? name.trim() : "Superset",
            components: exerciseIds,
        });

        const savedSuperset = await superset.save();

        const selectedSet = new Set(selectedIds);
        
        const nextWorkout = program.workout.filter(
            (item: any) => !selectedSet.has(String(item))
        );

        nextWorkout.splice(insertIndex, 0, savedSuperset._id as any);

        program.workout = nextWorkout as any;
        await program.save();

        await WorkoutItem.deleteMany({ _id: { $in: selectedIds } });

        const updatedProgram = await Program.findById(programId).populate({
            path: "workout",
            populate: {
                path: "components",
            },
        });

        return res.status(200).json(updatedProgram);
    } catch (error) {
        res.status(500).json({ message: "Failed to create superset" });
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
    addExerciseSet,
    editExerciseSet,
    removeExerciseSet,
    moveExercise,
    deleteExercise,
    createSuperset
}