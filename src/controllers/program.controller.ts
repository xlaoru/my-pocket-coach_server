import { Request, Response } from 'express'
import '../models/exercise.model'
import { Exercise } from '../models/exercise.model'
import { Periodization } from '../models/periodization.model'
import { Program } from '../models/program.model'
import { Stage } from '../models/stage.model'
import { Template } from '../models/template.model'
import { User } from '../models/user.model'
import '../models/workoutItem.model'
import { WorkoutItem } from '../models/workoutItem.model'

async function getPrograms(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const programs = await Program.find({ user: userId })
      .sort({ _id: -1 })
      .populate({
        path: 'workout',
        populate: {
          path: 'components',
        },
      })
      .populate({
        path: 'periodizationStage',
        populate: { path: 'periodizationId', select: 'name' },
      })

    res.status(200).json(programs)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch programs' })
  }
}

async function getProgramById(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { id } = req.params

    const program = await Program.findById(id)
      .populate({
        path: 'workout',
        populate: {
          path: 'components',
        },
      })
      .populate({
        path: 'periodizationStage',
        populate: { path: 'periodizationId', select: 'name' },
      })

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    if (!program.user.equals(userId)) {
      return res.status(403).json({ message: 'You are not allowed to watch this program' })
    }

    res.status(200).json(program)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch program' })
  }
}

async function createProgram(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { name, description } = req.body

    const newProgram = new Program({
      name,
      description,
      user: userId,
    })

    const savedProgram = await newProgram.save()

    res.status(201).json(savedProgram)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create program' })
  }
}

async function editProgram(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { id } = req.params

    const { name, description = '' } = req.body

    const program = await Program.findById(id)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    if (!program.user.equals(userId)) {
      return res.status(403).json({ message: 'You are not allowed to watch this program' })
    }

    program.name = name || program.name
    program.description = description || program.description

    const updatedProgram = await program.save()

    res.status(200).json(updatedProgram)
  } catch (error) {
    res.status(500).json({ message: 'Failed to update program' })
  }
}

async function deleteProgram(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { id } = req.params

    const program = await Program.findById(id).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    if (!program.user.equals(userId)) {
      return res.status(403).json({ message: 'You are not allowed to watch this program' })
    }

    const exerciseIds = program.workout.flatMap((item: any) => item.components)

    const workoutItemIds = program.workout.map((item: any) => item._id ?? item)

    await Exercise.deleteMany({ _id: { $in: exerciseIds } })

    await WorkoutItem.deleteMany({ _id: { $in: workoutItemIds } })

    await Program.findByIdAndDelete(id)

    res.status(200).json({ message: 'Program deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete program' })
  }
}

async function linkStage(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { programId, periodizationId, stageId } = req.params

    const program = await Program.findById(programId)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    if (!program.user.equals(userId)) {
      return res.status(403).json({ message: 'You are not allowed to watch this program' })
    }

    const periodization = await Periodization.findById(periodizationId)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    if (!periodization.user.equals(userId)) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to link this periodization to that program' })
    }

    const stage = await Stage.findById(stageId)

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' })
    }

    const isOwner = periodization.stages.some((id) => id.equals(stageId as any))

    if (!isOwner) {
      return res.status(403).json({ message: 'Your stage is not from this periodization' })
    }

    program.periodizationStage = stageId as any

    await program.save()

    res.status(200).json({ message: 'Periodization stage was linked succesfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to link periodization stage to program' })
  }
}

async function unlinkStage(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { programId, periodizationId, stageId } = req.params

    const program = await Program.findById(programId)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    if (!program.user.equals(userId)) {
      return res.status(403).json({ message: 'You are not allowed to watch this program' })
    }

    const periodization = await Periodization.findById(periodizationId)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    if (!periodization.user.equals(userId)) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to link this periodization to that program' })
    }

    const stage = await Stage.findById(stageId)

    if (!stage) {
      return res.status(404).json({ message: 'Stage not found' })
    }

    const isOwner = periodization.stages.some((id) => id.equals(stageId as any))

    if (!isOwner) {
      return res.status(403).json({ message: 'Your stage is not from this periodization' })
    }

    if (!program.periodizationStage || !program.periodizationStage.equals(stageId as any)) {
      return res.status(400).json({ message: 'Program is not linked to this stage' })
    }

    program.periodizationStage = null

    await program.save()

    res.status(200).json({ message: 'Periodization stage was unlinked succesfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink periodization stage to program' })
  }
}

async function generateProgram(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const { templateId } = req.params

    const template = await Template.findById(templateId).populate({
      path: 'templateWorkout',
      populate: {
        path: 'components',
      },
    })

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (!template.user.equals(userId)) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to generate any programs from this template' })
    }

    const workoutItemIds = []

    for (const templateWorkoutItem of template.templateWorkout as any[]) {
      const exercises = await Exercise.insertMany(
        templateWorkoutItem.components.map((templateExercise: any) => ({
          name: templateExercise.name,
          sets: Array.from({ length: templateExercise.sets }, () => ({
            weight: 0,
            reps: 0,
          })),
        })),
      )

      const workoutItem = await new WorkoutItem({
        type: templateWorkoutItem.type,
        name: templateWorkoutItem.name,
        components: exercises.map((exercise) => exercise._id),
      }).save()

      workoutItemIds.push(workoutItem._id)
    }

    const newProgram = await new Program({
      user: userId,
      name: template.name,
      description: template.description ?? '',
      date: new Date(),
      workout: workoutItemIds,
    }).save()

    const populatedProgram = await Program.findById(newProgram._id).populate({
      path: 'workout',
      populate: {
        path: 'components',
      },
    })

    res.status(201).json(populatedProgram)
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate program' })
  }
}

export {
  createProgram,
  deleteProgram,
  editProgram,
  generateProgram,
  getProgramById,
  getPrograms,
  linkStage,
  unlinkStage,
}
