import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import { Exercise } from "../models/exercise.model";
import { Program } from "../models/program.model";
import { WorkoutItem } from "../models/workoutItem.model";

dotenv.config();

type ProgramJson = {
  name: string;
  description?: string;
  date: string;
  workout: Array<{
    type: "exercise" | "superset";
    name: string;
    sets?: Array<{ weight: number; reps: number }>;
    components?: Array<{
      type: "exercise";
      name: string;
      sets: Array<{ weight: number; reps: number }>;
    }>;
  }>;
};

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is missing");

  const jsonPath = path.resolve(process.cwd(), "./src/scripts/programs.json");
  const programs = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as ProgramJson[];

  await mongoose.connect(mongoUri);

  await Program.deleteMany({});
  await WorkoutItem.deleteMany({});
  await Exercise.deleteMany({});

  for (const program of programs) {
    const workoutIds: mongoose.Types.ObjectId[] = [];

    for (const item of program.workout) {
      if (item.type === "exercise") {
        const exerciseDoc = await Exercise.create({
          name: item.name,
          sets: item.sets ?? [],
        });

        const doc = await WorkoutItem.create({
          type: "exercise",
          name: item.name,
          components: [exerciseDoc._id],
        });
        workoutIds.push(doc._id);
        continue;
      }

      const exerciseIds: mongoose.Types.ObjectId[] = [];
      for (const ex of item.components ?? []) {
        const exDoc = await Exercise.create({ name: ex.name, sets: ex.sets });
        exerciseIds.push(exDoc._id);
      }

      const supersetDoc = await WorkoutItem.create({
        type: "superset",
        name: item.name,
        components: exerciseIds,
      });
      workoutIds.push(supersetDoc._id);
    }

    await Program.create({
      name: program.name,
      ...(program.description ? { description: program.description } : {}),
      date: new Date(program.date),
      workout: workoutIds,
    });
  }

  console.log(`Seed done. Programs: ${programs.length}`);
  await mongoose.disconnect();
}

main().catch(async (error: unknown) => {
  console.error(error);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
