import { Request, Response } from 'express'

async function getStages(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Stages!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stages' })
  }
}

async function getStageById(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Stage!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stage' })
  }
}

async function createStage(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'New stage!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create stage' })
  }
}

async function editStageName(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Edited stage name!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit stage name' })
  }
}

async function editStageDescription(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Edited stage description!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit stage description' })
  }
}

async function moveStage(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Moved stage!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to move stage' })
  }
}

async function deleteStage(req: Request, res: Response) {
  try {
    res.status(200).json({ message: 'Deleted stage!' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete stage' })
  }
}

export {
  createStage,
  deleteStage,
  editStageDescription,
  editStageName,
  getStageById,
  getStages,
  moveStage,
}
