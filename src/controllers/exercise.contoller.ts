import { Request, Response } from 'express'
import '../models/exercise.model'
import { Exercise } from '../models/exercise.model'
import { Program } from '../models/program.model'
import '../models/workoutItem.model'
import { WorkoutItem } from '../models/workoutItem.model'

async function createExercise(req: Request, res: Response) {
  try {
    const { programId } = req.params

    const { name, sets } = req.body

    const program = await Program.findById(programId)

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const newExercise = new Exercise({
      name,
      sets,
    })

    const savedExercise = await newExercise.save()

    const newWorkoutItem = new WorkoutItem({
      type: 'exercise',
      name,
      components: [savedExercise._id],
    })

    const savedWorkoutItem = await newWorkoutItem.save()

    program.workout.push(savedWorkoutItem._id)

    await program.save()

    res.status(201).json(savedExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create exercise' })
  }
}

async function editExerciseName(req: Request, res: Response) {
  try {
    const { programId, exerciseId } = req.params

    const { name } = req.body

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item.components.includes(exerciseId))

    if (!workoutItem) {
      return res.status(404).json({ message: 'Exercise not found in program' })
    }

    const exercise = await Exercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    exercise.name = name || exercise.name

    const updatedExercise = await exercise.save()

    if ((workoutItem as any).type === 'exercise') {
      ;(workoutItem as any).name = name || (workoutItem as any).name

      await (workoutItem as any).save()
    }

    res.status(200).json(updatedExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit exercise name' })
  }
}

async function addExerciseSet(req: Request, res: Response) {
  try {
    const { programId, exerciseId } = req.params

    const { weight, reps } = req.body

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item.components.includes(exerciseId))

    if (!workoutItem) {
      return res.status(404).json({ message: 'Exercise not found in program' })
    }

    const exercise = await Exercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    exercise.sets.push({ weight, reps })

    const updatedExercise = await exercise.save()

    res.status(200).json(updatedExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add exercise set' })
  }
}

async function editExerciseSet(req: Request, res: Response) {
  try {
    const { programId, exerciseId, setIndex } = req.params

    const { weight, reps } = req.body as { weight?: unknown; reps?: unknown }

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item.components.includes(exerciseId))

    if (!workoutItem) {
      return res.status(404).json({ message: 'Exercise not found in program' })
    }

    const exercise = await Exercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    if (Number(setIndex) < 0 || Number(setIndex) >= exercise.sets.length) {
      return res.status(400).json({ message: 'Invalid set index' })
    }

    const parsedSetIndex = Number(setIndex)
    const hasWeight = weight !== undefined
    const hasReps = reps !== undefined

    if (!hasWeight && !hasReps) {
      return res.status(400).json({ message: 'At least one field is required: weight or reps' })
    }

    if (hasWeight && (typeof weight !== 'number' || Number.isNaN(weight) || weight < 0)) {
      return res.status(400).json({ message: 'Invalid weight' })
    }

    if (hasReps && (typeof reps !== 'number' || Number.isNaN(reps) || reps < 0)) {
      return res.status(400).json({ message: 'Invalid reps' })
    }

    const setToUpdate = exercise.sets[parsedSetIndex]

    if (!setToUpdate) {
      return res.status(400).json({ message: 'Invalid set index' })
    }

    if (hasWeight) {
      setToUpdate.weight = weight
    }

    if (hasReps) {
      setToUpdate.reps = reps
    }

    const updatedExercise = await exercise.save()

    res.status(200).json(updatedExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit exercise set' })
  }
}

async function removeExerciseSet(req: Request, res: Response) {
  try {
    const { programId, exerciseId, setIndex } = req.params

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item.components.includes(exerciseId))

    if (!workoutItem) {
      return res.status(404).json({ message: 'Exercise not found in program' })
    }

    const exercise = await Exercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    if (Number(setIndex) < 0 || Number(setIndex) >= exercise.sets.length) {
      return res.status(400).json({ message: 'Invalid set index' })
    }

    exercise.sets.splice(Number(setIndex), 1)

    const updatedExercise = await exercise.save()

    res.status(200).json(updatedExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove exercise set' })
  }
}

async function moveExercise(req: Request, res: Response) {
  try {
    const { programId } = req.params

    const { containerId, sourceIndex, destinationIndex } = req.body

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    if (containerId === programId) {
      if (
        sourceIndex < 0 ||
        sourceIndex >= program.workout.length ||
        destinationIndex < 0 ||
        destinationIndex >= program.workout.length
      ) {
        return res.status(400).json({ message: 'Invalid source or destination index' })
      }

      const workoutItem = program.workout[sourceIndex]

      if (!workoutItem) {
        return res.status(400).json({ message: 'Invalid source index' })
      }

      program.workout.splice(sourceIndex, 1)

      program.workout.splice(destinationIndex, 0, workoutItem)

      await program.save()

      res.status(200).json({ message: 'Exercise moved successfully' })
    } else {
      const superset = program.workout.find((item: any) => item._id.toString() === containerId)

      if (!superset) {
        return res.status(404).json({ message: 'Superset not found' })
      }

      if ((superset as any).type !== 'superset') {
        return res.status(400).json({ message: 'Container is not a superset' })
      }

      if (
        sourceIndex < 0 ||
        sourceIndex >= (superset as any).components.length ||
        destinationIndex < 0 ||
        destinationIndex >= (superset as any).components.length
      ) {
        return res.status(400).json({ message: 'Invalid source or destination index' })
      }

      const exerciseId = (superset as any).components[sourceIndex]

      if (!exerciseId) {
        return res.status(400).json({ message: 'Invalid source index' })
      }

      ;(superset as any).components.splice(sourceIndex, 1)
      ;(superset as any).components.splice(destinationIndex, 0, exerciseId)

      await (superset as any).save()

      res.status(200).json({ message: 'Exercise moved successfully' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to move exercise' })
  }
}

async function deleteExercise(req: Request, res: Response) {
  try {
    const { programId, exerciseId } = req.params

    const program = await Program.findById(programId).populate('workout')

    if (!program) {
      return res.status(404).json({ message: 'Program not found' })
    }

    const workoutItem = program.workout.find((item: any) => item.components.includes(exerciseId))

    if (!workoutItem) {
      return res.status(404).json({ message: 'Exercise not found in program' })
    }

    await Exercise.findByIdAndDelete(exerciseId)

    if ((workoutItem as any).type === 'superset') {
      ;(workoutItem as any).components = (workoutItem as any).components.filter(
        (component: any) => component.toString() !== exerciseId,
      )

      if ((workoutItem as any).components.length === 0) {
        program.workout = program.workout.filter(
          (item: any) => item._id.toString() !== workoutItem._id.toString(),
        )
        await WorkoutItem.findByIdAndDelete(workoutItem._id)
      } else {
        await (workoutItem as any).save()
      }
    } else {
      program.workout = program.workout.filter(
        (item: any) => item._id.toString() !== workoutItem._id.toString(),
      )
      await WorkoutItem.findByIdAndDelete(workoutItem._id)
    }

    await program.save()

    res.status(200).json({ message: 'Exercise deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exercise' })
  }
}

export {
  addExerciseSet,
  createExercise,
  deleteExercise,
  editExerciseName,
  editExerciseSet,
  moveExercise,
  removeExerciseSet,
}
