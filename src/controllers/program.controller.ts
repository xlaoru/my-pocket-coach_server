import { Request, Response } from 'express'
import '../models/exercise.model'
import { Exercise } from '../models/exercise.model'
import { Periodization } from '../models/periodization.mode'
import { Program } from '../models/program.model'
import { Stage } from '../models/stage.model'
import '../models/workoutItem.model'
import { WorkoutItem } from '../models/workoutItem.model'

async function getPrograms(req: Request, res: Response) {
  try {
    const programs = await Program.find()
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

    res.status(200).json(program)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch program' })
  }
}

async function createProgram(req: Request, res: Response) {
  try {
    const { name, description, workout } = req.body

    const newProgram = new Program({
      name,
      description,
      workout,
    })

    const savedProgram = await newProgram.save()

    res.status(201).json(savedProgram)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create program' })
  }
}

async function editProgram(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { name, description = '' } = req.body

    const program = await Program.findById(id)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
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
    const { id } = req.params

    const program = await Program.findById(id).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
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
    const { programId, periodizationId, stageId } = req.params

    const program = await Program.findById(programId)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const periodization = await Periodization.findById(periodizationId)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
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
    const { programId, periodizationId, stageId } = req.params

    const program = await Program.findById(programId)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const periodization = await Periodization.findById(periodizationId)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
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

export {
  createProgram,
  deleteProgram,
  editProgram,
  getProgramById,
  getPrograms,
  linkStage,
  unlinkStage,
}
