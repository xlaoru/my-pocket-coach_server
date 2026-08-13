import { Request, Response } from 'express'
import { Periodization } from '../models/periodization.mode'
import { Program } from '../models/program.model'
import { Stage } from '../models/stage.model'

async function getPeriodizations(req: Request, res: Response) {
  try {
    const periodizations = await Periodization.find()
      .sort({ _id: -1 })
      .populate({
        path: 'stages',
      })

    res.status(200).json(periodizations)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch periodizations' })
  }
}

async function getPeriodizationById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const periodization = await Periodization.findById(id).populate({
      path: 'stages',
    })

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    res.status(200).json(periodization)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch periodization' })
  }
}

async function createPeriodization(req: Request, res: Response) {
  try {
    const { name, description } = req.body

    const newPeriodization = new Periodization({
      name,
      description,
    })

    const savedPeriodization = await newPeriodization.save()

    res.status(200).json(savedPeriodization)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create periodization' })
  }
}

async function editPeriodizationName(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { name } = req.body

    const periodization = await Periodization.findById(id)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    periodization.name = name || periodization.name

    const updatedPeriodization = await periodization.save()

    res.status(200).json(updatedPeriodization)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit periodization name' })
  }
}

async function editPeriodizationDescription(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { description } = req.body

    const periodization = await Periodization.findById(id)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    periodization.description = description || periodization.description

    const updatedPeriodization = await periodization.save()

    res.status(200).json(updatedPeriodization)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit periodization description' })
  }
}

async function deletePeriodization(req: Request, res: Response) {
  try {
    const { id } = req.params

    const periodization = await Periodization.findById(id)

    if (!periodization) {
      return res.status(404).json({ message: 'Periodization not found' })
    }

    const linkedProgram = await Program.findOne({
      periodizationStage: { $in: periodization.stages },
    })

    if (linkedProgram) {
      return res.status(409).json({
        message: 'One or more stages are linked to a program. Unlink them before deleting',
      })
    }

    await Stage.deleteMany({ _id: { $in: periodization.stages } })

    await Periodization.findByIdAndDelete(id)

    res.status(200).json({ message: 'Periodization deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete periodization' })
  }
}

export {
  createPeriodization,
  deletePeriodization,
  editPeriodizationDescription,
  editPeriodizationName,
  getPeriodizationById,
  getPeriodizations,
}
