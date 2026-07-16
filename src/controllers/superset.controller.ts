import { Request, Response } from 'express'
import '../models/exercise.model'
import { Exercise } from '../models/exercise.model'
import { Program } from '../models/program.model'
import '../models/workoutItem.model'
import { WorkoutItem } from '../models/workoutItem.model'

async function createSuperset(req: Request, res: Response) {
  try {
    const { programId } = req.params

    const { name, workoutItemIds } = req.body

    if (!Array.isArray(workoutItemIds) || workoutItemIds.length < 2) {
      return res.status(400).json({ message: 'Select at least 2 exercises' })
    }

    const program = await Program.findById(programId)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const selectedIds = workoutItemIds.map((itemId) => String(itemId))
    const programWorkoutIds = program.workout.map((item: any) => String(item))

    const hasUnknownItems = selectedIds.some((itemId) => !programWorkoutIds.includes(itemId))

    if (hasUnknownItems) {
      return res.status(400).json({ message: 'Some selected items are not in this program' })
    }

    const workoutItems = await WorkoutItem.find({ _id: { $in: selectedIds } })

    if (workoutItems.length !== selectedIds.length) {
      return res.status(400).json({ message: 'Some workout items were not found' })
    }

    const canGroup = workoutItems.every(
      (item) => item.type === 'exercise' && item.components.length === 1,
    )

    if (!canGroup) {
      return res.status(400).json({
        message: 'Only single exercises can be grouped into a superset',
      })
    }

    const exerciseIds = workoutItems
      .sort((a, b) => selectedIds.indexOf(String(a._id)) - selectedIds.indexOf(String(b._id)))
      .map((item) => item.components[0])

    const superset = new WorkoutItem({
      type: 'superset',
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Superset',
      components: exerciseIds,
    })

    const savedSuperset = await superset.save()

    const selectedSet = new Set(selectedIds)
    const firstSelectedId = selectedIds[0]

    const nextWorkout = program.workout.reduce((acc: any[], item: any) => {
      const itemId = String(item)

      if (!selectedSet.has(itemId)) {
        acc.push(item)
        return acc
      }

      if (itemId === firstSelectedId) {
        acc.push(savedSuperset._id)
      }

      return acc
    }, [])

    program.workout = nextWorkout as any
    await program.save()

    await WorkoutItem.deleteMany({ _id: { $in: selectedIds } })

    const newSuperset = await savedSuperset.populate('components')

    return res.status(200).json(newSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create superset' })
  }
}

async function editSupersetName(req: Request, res: Response) {
  try {
    const { programId, supersetId } = req.params

    const { name } = req.body

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item._id.toString() === supersetId)

    if (!workoutItem) {
      return res.status(404).json({ message: 'Superset not found in program' })
    }

    if ((workoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    ;(workoutItem as any).name = name || (workoutItem as any).name

    await (workoutItem as any).save()

    const updatedSuperset = await (workoutItem as any).populate('components')

    res.status(200).json(updatedSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit superset name' })
  }
}

async function deleteSuperset(req: Request, res: Response) {
  try {
    const { programId, supersetId } = req.params

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item._id.toString() === supersetId)

    if (!workoutItem) {
      return res.status(404).json({ message: 'Superset not found in program' })
    }

    if ((workoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const exerciseIds = (workoutItem as any).components

    await WorkoutItem.findByIdAndDelete(supersetId)

    program.workout = program.workout.filter((item: any) => item._id.toString() !== supersetId)

    await Exercise.deleteMany({ _id: { $in: exerciseIds } })

    await program.save()

    res.status(200).json({ message: 'Superset deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete superset' })
  }
}

async function unlinkAllSupersetExercises(req: Request, res: Response) {
  try {
    const { programId, supersetId } = req.params

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    let deletedSupersetIndex = -1

    const workoutItem = program.workout.find((item: any, index: number) => {
      deletedSupersetIndex = index
      return item._id.toString() === supersetId
    })

    if (!workoutItem) {
      return res.status(404).json({ message: 'Superset not found in program' })
    }

    if ((workoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    if (deletedSupersetIndex === -1) {
      return res.status(400).json({ message: 'Superset not found in program workout' })
    }

    const exercises = await (workoutItem as any).populate('components')

    program.workout = program.workout.filter((item: any) => item._id.toString() !== supersetId)

    const newWorkoutItemsData = exercises.components.map((exercise: any) => ({
      type: 'exercise',
      name: exercise.name,
      components: [exercise._id],
    }))

    const createdWorkoutItems = await WorkoutItem.insertMany(newWorkoutItemsData)

    const createdWorkoutItemIds = createdWorkoutItems.map((item) => item._id)

    program.workout.splice(deletedSupersetIndex, 0, ...(createdWorkoutItemIds as any))

    await program.save()

    await WorkoutItem.findByIdAndDelete(supersetId)

    const populatedWorkoutItems = await WorkoutItem.find({
      _id: { $in: createdWorkoutItemIds },
    }).populate('components')

    res.status(200).json(populatedWorkoutItems)
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink superset exercises' })
  }
}

async function addNewExerciseInsideSuperset(req: Request, res: Response) {
  try {
    const { programId, supersetId } = req.params

    const { name, sets } = req.body

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item._id.toString() === supersetId)

    if (!workoutItem) {
      return res.status(404).json({ message: 'Superset not found in program' })
    }

    if ((workoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const newExercise = new Exercise({
      name,
      sets,
    })

    const savedExercise = await newExercise.save()

    ;(workoutItem as any).components.push(savedExercise._id)

    await (workoutItem as any).save()

    const updatedSuperset = await (workoutItem as any).populate('components')

    res.status(200).json(updatedSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add an exercise inside superset' })
  }
}

async function linkCurrentSupersetExercises(req: Request, res: Response) {
  try {
    const { programId, supersetId, exerciseId } = req.params

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item._id.toString() === supersetId)

    if (!workoutItem) {
      return res.status(404).json({ message: 'Superset not found in program' })
    }

    if ((workoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const exercise = await Exercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    if (
      (workoutItem as any).components.some((component: any) => component.toString() === exerciseId)
    ) {
      return res.status(400).json({ message: 'Exercise is already linked to this superset' })
    }

    const linkedWorkoutItem = program.workout.find(
      (item: any) =>
        item._id.toString() !== supersetId &&
        item.type === 'exercise' &&
        item.components.some((component: any) => component.toString() === exerciseId),
    )

    if (!linkedWorkoutItem) {
      return res.status(404).json({
        message: 'Workout item not found in program',
      })
    }

    program.workout = program.workout.filter(
      (item: any) => item._id.toString() !== linkedWorkoutItem._id.toString(),
    )
    ;(workoutItem as any).components.push(exercise._id)

    await program.save()
    await (workoutItem as any).save()
    await WorkoutItem.findByIdAndDelete(linkedWorkoutItem._id)

    const updatedSuperset = await (workoutItem as any).populate('components')

    res.status(200).json(updatedSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to link superset exercise' })
  }
}

async function unlinkCurrentSupersetExercises(req: Request, res: Response) {
  try {
    const { programId, supersetId, exerciseId } = req.params

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item._id.toString() === supersetId)

    if (!workoutItem) {
      return res.status(404).json({ message: 'Superset not found in program' })
    }

    if ((workoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const exercise = await Exercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    if (
      !(workoutItem as any).components.some((component: any) => component.toString() === exerciseId)
    ) {
      return res.status(400).json({ message: 'Exercise is not linked to this superset' })
    }

    ;(workoutItem as any).components = (workoutItem as any).components.filter(
      (component: any) => component.toString() !== exerciseId,
    )

    const newWorkoutItem = new WorkoutItem({
      type: 'exercise',
      name: exercise.name,
      components: [exercise._id],
    })

    const savedWorkoutItem = await newWorkoutItem.save()

    const supersetIndex = program.workout.findIndex(
      (item: any) => item._id.toString() === supersetId,
    )

    if (supersetIndex === -1) {
      return res.status(400).json({ message: 'Superset not found in program workout' })
    }

    program.workout.splice(supersetIndex + 1, 0, savedWorkoutItem._id as any)

    await program.save()

    await (workoutItem as any).save()

    const updatedSuperset = await (workoutItem as any).populate('components')

    res.status(200).json(updatedSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink superset exercise' })
  }
}

export {
  addNewExerciseInsideSuperset,
  createSuperset,
  deleteSuperset,
  editSupersetName,
  linkCurrentSupersetExercises,
  unlinkAllSupersetExercises,
  unlinkCurrentSupersetExercises,
}
