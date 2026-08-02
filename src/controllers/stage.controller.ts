import { Request, Response } from 'express'
import { Periodization } from '../models/periodization.mode'
import { Program } from '../models/program.model'
import { Stage } from '../models/stage.model'

async function createStage(req: Request, res: Response) {
  try {
    const { periodizationId } = req.params

    const { name, description } = req.body

    const periodization = await Periodization.findById(periodizationId)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    const stage = new Stage({
      name,
      description,
      periodizationId: periodization._id,
    })

    const savedStage = await stage.save()

    periodization.stages.push(savedStage._id)

    await periodization.save()

    res.status(200).json(savedStage)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create stage' })
  }
}

async function editStageName(req: Request, res: Response) {
  try {
    const { periodizationId, stageId } = req.params

    const { name } = req.body

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

    stage.name = name || stage.name

    await stage.save()

    res.status(200).json(stage)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit stage name' })
  }
}

async function editStageDescription(req: Request, res: Response) {
  try {
    const { periodizationId, stageId } = req.params

    const { description } = req.body

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

    stage.description = description || stage.description

    await stage.save()

    res.status(200).json(stage)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit stage description' })
  }
}

async function moveStage(req: Request, res: Response) {
  try {
    const { periodizationId } = req.params

    const { sourceIndex, destinationIndex } = req.body

    const periodization = await Periodization.findById(periodizationId)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    if (
      sourceIndex < 0 ||
      sourceIndex >= periodization.stages.length ||
      destinationIndex < 0 ||
      destinationIndex >= periodization.stages.length
    ) {
      return res.status(400).json({ message: 'Invalid source or destination index' })
    }

    const stage = periodization.stages[sourceIndex]

    if (!stage) {
      return res.status(400).json({ message: 'Invalid source or destination index' })
    }

    periodization.stages.splice(sourceIndex, 1)

    periodization.stages.splice(destinationIndex, 0, stage)

    await periodization.save()

    res.status(200).json({ message: 'Stage moved successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to move stage' })
  }
}

async function deleteStage(req: Request, res: Response) {
  try {
    const { periodizationId, stageId } = req.params

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

    const linkedProgram = await Program.findOne({ periodizationStage: stageId as any })

    if (linkedProgram) {
      return res
        .status(409)
        .json({ message: 'Stage is already linked to program. Unlink it before deleting' })
    }

    periodization.stages = periodization.stages.filter((id) => !id.equals(stageId as any))

    await periodization.save()

    await Stage.findByIdAndDelete(stageId)

    res.status(200).json({ message: 'Stage deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete stage' })
  }
}

export { createStage, deleteStage, editStageDescription, editStageName, moveStage }
