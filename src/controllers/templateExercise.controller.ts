import { Request, Response } from 'express'
import { Template } from '../models/template.model'
import { TemplateExercise } from '../models/templateExercise.model'
import { TemplateWorkoutItem } from '../models/templateWorkoutItem.model'

async function createExercise(req: Request, res: Response) {
  try {
    const { templateId } = req.params

    const { name, sets } = req.body

    const template = await Template.findById(templateId)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const newTemplateExercise = new TemplateExercise({
      name,
      sets,
    })

    const savedTemplateExercise = await newTemplateExercise.save()

    const newTemplateWorkoutItem = new TemplateWorkoutItem({
      type: 'exercise',
      name,
      components: [savedTemplateExercise._id],
    })

    const savedTemplateWorkoutItem = await newTemplateWorkoutItem.save()

    template.templateWorkout.push(savedTemplateWorkoutItem._id)

    await template.save()

    res.status(201).json(savedTemplateExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create exercise' })
  }
}

async function editExerciseName(req: Request, res: Response) {
  try {
    const { templateId, exerciseId } = req.params

    const { name } = req.body

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateWorkoutItem = template.templateWorkout.find((item: any) =>
      item.components.includes(exerciseId),
    )

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Exercise not found in template' })
    }

    const exercise = await TemplateExercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    exercise.name = name || exercise.name

    const updatedExercise = await exercise.save()

    if ((templateWorkoutItem as any).type === 'exercise') {
      ;(templateWorkoutItem as any).name = name || (templateWorkoutItem as any).name

      await (templateWorkoutItem as any).save()
    }

    res.status(200).json(updatedExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit exercise name' })
  }
}

async function editExerciseSet(req: Request, res: Response) {
  try {
    const { templateId, exerciseId } = req.params

    const { sets } = req.body

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateWorkoutItem = template.templateWorkout.find((item: any) =>
      item.components.includes(exerciseId),
    )

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Exercise not found in template' })
    }

    const exercise = await TemplateExercise.findById(exerciseId)

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    exercise.sets = sets || exercise.sets

    const updatedExercise = await exercise.save()

    res.status(200).json(updatedExercise)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit exercise sets' })
  }
}

async function moveExercise(req: Request, res: Response) {
  try {
    const { templateId } = req.params

    const { containerId, sourceIndex, destinationIndex } = req.body

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    if (containerId === templateId) {
      if (
        sourceIndex < 0 ||
        sourceIndex >= template.templateWorkout.length ||
        destinationIndex < 0 ||
        destinationIndex >= template.templateWorkout.length
      ) {
        return res.status(400).json({ message: 'Invalid source or destination index' })
      }

      const templateWorkoutItem = template.templateWorkout[sourceIndex]

      if (!templateWorkoutItem) {
        return res.status(400).json({ message: 'Invalid source index' })
      }

      template.templateWorkout.splice(sourceIndex, 1)

      template.templateWorkout.splice(destinationIndex, 0, templateWorkoutItem)

      await template.save()

      res.status(200).json({ message: 'Exercise moved successfully' })
    } else {
      const superset = template.templateWorkout.find(
        (item: any) => item._id.toString() === containerId,
      )

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
    const { templateId, exerciseId } = req.params

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateWorkoutItem = template.templateWorkout.find((item: any) =>
      item.components.includes(exerciseId),
    )

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Exercise not found in template' })
    }

    await TemplateExercise.findByIdAndDelete(exerciseId)

    if ((templateWorkoutItem as any).type === 'superset') {
      ;(templateWorkoutItem as any).components = (templateWorkoutItem as any).components.filter(
        (component: any) => component.toString() !== exerciseId,
      )

      if ((templateWorkoutItem as any).components.length === 0) {
        template.templateWorkout = template.templateWorkout.filter(
          (item: any) => item._id.toString() !== templateWorkoutItem._id.toString(),
        )

        await TemplateWorkoutItem.findByIdAndDelete(templateWorkoutItem._id)
      } else {
        await (templateWorkoutItem as any).save()
      }
    } else {
      template.templateWorkout = template.templateWorkout.filter(
        (item: any) => item._id.toString() !== templateWorkoutItem._id.toString(),
      )

      await TemplateWorkoutItem.findByIdAndDelete(templateWorkoutItem._id)
    }

    await template.save()

    res.status(200).json({ message: 'Exercise deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exercise' })
  }
}

export { createExercise, deleteExercise, editExerciseName, editExerciseSet, moveExercise }
