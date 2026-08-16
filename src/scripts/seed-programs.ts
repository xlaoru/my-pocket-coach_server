import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'node:fs'
import path from 'node:path'

import { Exercise } from '../models/exercise.model'
import { Periodization } from '../models/periodization.model'
import { Program } from '../models/program.model'
import { Stage } from '../models/stage.model'
import { Template } from '../models/template.model'
import { TemplateExercise } from '../models/templateExercise.model'
import { TemplateWorkoutItem } from '../models/templateWorkoutItem.model'
import { User } from '../models/user.model'
import { WorkoutItem } from '../models/workoutItem.model'

dotenv.config()

type SeedUser = {
  name: string
  email: string
  password: string
}

const seedUsers: SeedUser[] = [
  { name: 'Alice', email: 'alice@example.com', password: 'password123' },
  { name: 'Bob', email: 'bob@example.com', password: 'password123' },
  { name: 'Carol', email: 'carol@example.com', password: 'password123' },
]

type ProgramJson = {
  name: string
  description?: string
  date: string
  workout: Array<{
    type: 'exercise' | 'superset'
    name: string
    sets?: Array<{ weight: number; reps: number }>
    components?: Array<{
      type: 'exercise'
      name: string
      sets: Array<{ weight: number; reps: number }>
    }>
  }>
}

type PeriodizationJson = {
  name: string
  description?: string
  stages: Array<{ name: string; description?: string }>
}

type TemplateJson = {
  name: string
  description?: string
  workout: Array<{
    type: 'exercise' | 'superset'
    name: string
    sets?: number
    components?: Array<{ name: string; sets?: number }>
  }>
}

const periodizations: PeriodizationJson[] = [
  {
    name: 'Strength Block',
    description: '12-week linear strength progression cycle.',
    stages: [
      {
        name: 'Accumulation',
        description: 'High volume, moderate intensity to build a work-capacity base.',
      },
      {
        name: 'Intensification',
        description: 'Volume drops as load increases toward heavier singles and doubles.',
      },
      {
        name: 'Peak',
        description: 'Low volume, near-max loads to express peak strength.',
      },
    ],
  },
  {
    name: 'Hypertrophy Cycle',
    description: '6-week hypertrophy-focused block with a planned deload.',
    stages: [
      {
        name: 'Volume Phase',
        description: 'High volume, moderate intensity to maximize muscle growth.',
      },
      {
        name: 'Deload',
        description: 'Reduced volume and intensity to recover before the next block.',
      },
    ],
  },
]

// Maps a program name to [periodizationIndex, stageIndex] in `periodizations`.
// Programs not listed here are seeded without a periodizationStage.
const programStageAssignments: Record<string, [number, number]> = {
  'Push Strength A': [0, 0],
  'Pull Hypertrophy B': [0, 1],
  'Upper Body Volume D': [1, 0],
}

// Index into `seedUsers` that owns each periodization.
// A program referencing a stage from a periodization must be owned by the same user.
const periodizationUserAssignments: Record<string, number> = {
  'Strength Block': 0, // Alice
  'Hypertrophy Cycle': 1, // Bob
}

const programUserAssignments: Record<string, number> = {
  'Push Strength A': 0, // Alice (uses Strength Block stage)
  'Pull Hypertrophy B': 0, // Alice (uses Strength Block stage)
  'Leg Day Power C': 2, // Carol
  'Upper Body Volume D': 1, // Bob (uses Hypertrophy Cycle stage)
  'Full Body Athletic E': 2, // Carol
}

const templateUserAssignments: Record<string, number> = {
  'Push Day Template': 0, // Alice
  'Pull Day Template': 1, // Bob
  'Leg Day Template': 2, // Carol
  'Full Body Template': 0, // Alice
}

async function main() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) throw new Error('MONGODB_URI is missing')

  const jsonPath = path.resolve(process.cwd(), './src/scripts/programs.json')
  const programs = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as ProgramJson[]

  const templatesJsonPath = path.resolve(process.cwd(), './src/scripts/templates.json')
  const templates = JSON.parse(fs.readFileSync(templatesJsonPath, 'utf-8')) as TemplateJson[]

  await mongoose.connect(mongoUri)

  await Program.deleteMany({})
  await WorkoutItem.deleteMany({})
  await Exercise.deleteMany({})
  await Periodization.deleteMany({})
  await Stage.deleteMany({})
  await Template.deleteMany({})
  await TemplateWorkoutItem.deleteMany({})
  await TemplateExercise.deleteMany({})
  await User.deleteMany({})

  const userDocs = []
  for (const seedUser of seedUsers) {
    const hashedPassword = await bcrypt.hash(seedUser.password, 7)
    const userDoc = await User.create({
      name: seedUser.name,
      email: seedUser.email,
      password: hashedPassword,
    })
    userDocs.push(userDoc)
  }

  const stageIdsByPeriodization: mongoose.Types.ObjectId[][] = []

  for (const periodization of periodizations) {
    const ownerIndex = periodizationUserAssignments[periodization.name] ?? 0

    const periodizationDoc = await Periodization.create({
      name: periodization.name,
      ...(periodization.description ? { description: periodization.description } : {}),
      stages: [],
      user: userDocs[ownerIndex]!._id,
    })

    const stageIds: mongoose.Types.ObjectId[] = []
    for (const stage of periodization.stages) {
      const stageDoc = await Stage.create({
        name: stage.name,
        ...(stage.description ? { description: stage.description } : {}),
        periodizationId: periodizationDoc._id,
      })
      stageIds.push(stageDoc._id)
    }

    periodizationDoc.stages = stageIds
    await periodizationDoc.save()

    stageIdsByPeriodization.push(stageIds)
  }

  for (const program of programs) {
    const workoutIds: mongoose.Types.ObjectId[] = []

    for (const item of program.workout) {
      if (item.type === 'exercise') {
        const exerciseDoc = await Exercise.create({
          name: item.name,
          sets: item.sets ?? [],
        })

        const doc = await WorkoutItem.create({
          type: 'exercise',
          name: item.name,
          components: [exerciseDoc._id],
        })
        workoutIds.push(doc._id)
        continue
      }

      const exerciseIds: mongoose.Types.ObjectId[] = []
      for (const ex of item.components ?? []) {
        const exDoc = await Exercise.create({ name: ex.name, sets: ex.sets })
        exerciseIds.push(exDoc._id)
      }

      const supersetDoc = await WorkoutItem.create({
        type: 'superset',
        name: item.name,
        components: exerciseIds,
      })
      workoutIds.push(supersetDoc._id)
    }

    const assignment = programStageAssignments[program.name]
    const periodizationStage = assignment
      ? stageIdsByPeriodization[assignment[0]]?.[assignment[1]]
      : undefined

    const ownerIndex = programUserAssignments[program.name] ?? 0

    await Program.create({
      name: program.name,
      ...(program.description ? { description: program.description } : {}),
      date: new Date(program.date),
      workout: workoutIds,
      ...(periodizationStage ? { periodizationStage } : {}),
      user: userDocs[ownerIndex]!._id,
    })
  }

  for (const template of templates) {
    const templateWorkoutIds: mongoose.Types.ObjectId[] = []

    for (const item of template.workout) {
      if (item.type === 'exercise') {
        const exerciseDoc = await TemplateExercise.create({
          name: item.name,
          sets: item.sets ?? 0,
        })

        const workoutItemDoc = await TemplateWorkoutItem.create({
          type: 'exercise',
          name: item.name,
          components: [exerciseDoc._id],
        })
        templateWorkoutIds.push(workoutItemDoc._id)
        continue
      }

      const exerciseIds: mongoose.Types.ObjectId[] = []
      for (const ex of item.components ?? []) {
        const exerciseDoc = await TemplateExercise.create({
          name: ex.name,
          sets: ex.sets ?? 0,
        })
        exerciseIds.push(exerciseDoc._id)
      }

      const supersetDoc = await TemplateWorkoutItem.create({
        type: 'superset',
        name: item.name,
        components: exerciseIds,
      })
      templateWorkoutIds.push(supersetDoc._id)
    }

    const ownerIndex = templateUserAssignments[template.name] ?? 0

    await Template.create({
      name: template.name,
      ...(template.description ? { description: template.description } : {}),
      templateWorkout: templateWorkoutIds,
      user: userDocs[ownerIndex]!._id,
    })
  }

  console.log(
    `Seed done. Users: ${userDocs.length}, Programs: ${programs.length}, Periodizations: ${periodizations.length}, Templates: ${templates.length}`,
  )
  await mongoose.disconnect()
}

main().catch(async (error: unknown) => {
  console.error(error)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  process.exit(1)
})
