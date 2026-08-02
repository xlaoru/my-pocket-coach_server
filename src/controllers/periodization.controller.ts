import { Request, Response } from 'express'

async function getPeriodizations(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Periodizations!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch periodizations' })
  }
}

async function getPeriodizationById(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Periodization!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch periodization' })
  }
}

async function createPeriodization(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'New periodization!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create periodization' })
  }
}

async function editPeriodizationName(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Edited periodization name!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit periodization name' })
  }
}

async function editPeriodizationDescription(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Edited periodization description!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit periodization description' })
  }
}

async function deletePeriodization(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Deleted periodization!' })
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
