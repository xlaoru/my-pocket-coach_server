import { Request, Response } from 'express'
import { Template } from '../models/template.model'
import { TemplateExercise } from '../models/templateExercise.model'
import { TemplateWorkoutItem } from '../models/templateWorkoutItem.model'

async function createSuperset(req: Request, res: Response) {
  try {
    const { templateId } = req.params

    const { name, templateWorkoutItemIds } = req.body

    if (!Array.isArray(templateWorkoutItemIds) || templateWorkoutItemIds.length < 2) {
      return res.status(400).json({ message: 'Select at least 2 exercises' })
    }

    const template = await Template.findById(templateId)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const selectedIds = templateWorkoutItemIds.map((itemId) => String(itemId))
    const templateTemplateWorkoutIds = template.templateWorkout.map((item: any) => String(item))

    const hasUnknownItems = selectedIds.some(
      (itemId) => !templateTemplateWorkoutIds.includes(itemId),
    )

    if (hasUnknownItems) {
      return res.status(400).json({ message: 'Some selected items are not in this template' })
    }

    const templateWorkoutItems = await TemplateWorkoutItem.find({ _id: { $in: selectedIds } })

    if (templateWorkoutItems.length !== selectedIds.length) {
      return res.status(400).json({ message: 'Some workout items were not found' })
    }

    const canGroup = templateWorkoutItems.every(
      (item) => item.type === 'exercise' && item.components.length === 1,
    )

    if (!canGroup) {
      return res.status(400).json({
        message: 'Only single exercises can be grouped into a superset',
      })
    }

    const exerciseIds = templateWorkoutItems
      .sort((a, b) => selectedIds.indexOf(String(a._id)) - selectedIds.indexOf(String(b._id)))
      .map((item) => item.components[0])

    const superset = new TemplateWorkoutItem({
      type: 'superset',
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Superset',
      components: exerciseIds,
    })

    const savedSuperset = await superset.save()

    const selectedSet = new Set(selectedIds)
    const firtsSelectedId = selectedIds[0]

    const nextTemplateWorkout = template.templateWorkout.reduce((acc: any[], item: any) => {
      const itemId = String(item)

      if (!selectedSet.has(itemId)) {
        acc.push(item)
        return acc
      }

      if (itemId === firtsSelectedId) {
        acc.push(savedSuperset._id)
      }

      return acc
    }, [])

    template.templateWorkout = nextTemplateWorkout as any

    await template.save()

    await TemplateWorkoutItem.deleteMany({ _id: { $in: selectedIds } })

    const newSuperset = await savedSuperset.populate('components')

    res.status(200).json(newSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create superset' })
  }
}

async function editSupersetName(req: Request, res: Response) {
  try {
    const { templateId, supersetId } = req.params

    const { name } = req.body

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateWorkoutItem = template.templateWorkout.find(
      (item: any) => item._id.toString() === supersetId,
    )

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Superset not found in program' })
    }

    if ((templateWorkoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    ;(templateWorkoutItem as any).name = name || (templateWorkoutItem as any).name

    await (templateWorkoutItem as any).save()

    const updatedSuperset = await (templateWorkoutItem as any).populate('components')

    res.status(200).json(updatedSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit superset name' })
  }
}

async function deleteSuperset(req: Request, res: Response) {
  try {
    const { templateId, supersetId } = req.params

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateWorkoutItem = template.templateWorkout.find(
      (item: any) => item._id.toString() === supersetId,
    )

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Superset not found in template' })
    }

    if ((templateWorkoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const exerciseIds = (templateWorkoutItem as any).components

    template.templateWorkout = template.templateWorkout.filter(
      (item: any) => item._id.toString() !== supersetId,
    )

    await template.save()

    await TemplateWorkoutItem.findByIdAndDelete(supersetId)

    await TemplateExercise.deleteMany({ _id: { $in: exerciseIds } })

    res.status(200).json({ message: 'Superset deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete superset' })
  }
}

async function unlinkAllSupersetExercises(req: Request, res: Response) {
  try {
    const { templateId, supersetId } = req.params

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    let deletedSupersetIndex = -1

    const templateWorkoutItem = template.templateWorkout.find((item: any, index: number) => {
      deletedSupersetIndex = index
      return item._id.toString() === supersetId
    })

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Superset not found in template' })
    }

    if ((templateWorkoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    if (deletedSupersetIndex === -1) {
      return res.status(400).json({ message: 'Superset not found in template workout' })
    }

    const templateExercises = await (templateWorkoutItem as any).populate('components')

    template.templateWorkout = template.templateWorkout.filter(
      (item: any) => item._id.toString() !== supersetId,
    )

    const newTemplateWorkoutItemsData = templateExercises.components.map(
      (templateExercise: any) => ({
        type: 'exercise',
        name: templateExercise.name,
        components: [templateExercise._id],
      }),
    )

    const createdTemplateWorkoutItems = await TemplateWorkoutItem.insertMany(
      newTemplateWorkoutItemsData,
    )

    const createdTemplateWorkoutItemIds = createdTemplateWorkoutItems.map((item) => item._id)

    template.templateWorkout.splice(
      deletedSupersetIndex,
      0,
      ...(createdTemplateWorkoutItemIds as any),
    )

    await template.save()

    await TemplateWorkoutItem.findByIdAndDelete(supersetId)

    const populatedTemplateWorkoutItems = await TemplateWorkoutItem.find({
      _id: { $in: createdTemplateWorkoutItemIds },
    }).populate('components')

    res.status(200).json(populatedTemplateWorkoutItems)
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink superset exercises' })
  }
}

async function addNewExerciseInsideSuperset(req: Request, res: Response) {
  try {
    const { templateId, supersetId } = req.params

    const { name, sets } = req.body

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateWorkoutItem = template.templateWorkout.find(
      (item: any) => item._id.toString() === supersetId,
    )

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Superset not found in template' })
    }

    if ((templateWorkoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const newTemplateExercise = new TemplateExercise({
      name,
      sets,
    })

    const savedTemplateExercise = await newTemplateExercise.save()

    ;(templateWorkoutItem as any).components.push(savedTemplateExercise._id)

    await (templateWorkoutItem as any).save()

    const updatedTemplateSuperset = await (templateWorkoutItem as any).populate('components')

    res.status(200).json(updatedTemplateSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to add an exercise inside superset' })
  }
}

async function unlinkCurrentSupersetExercises(req: Request, res: Response) {
  try {
    const { templateId, supersetId, exerciseId } = req.params

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateSupersetIndex = template.templateWorkout.findIndex(
      (item: any) => item._id.toString() === supersetId,
    )

    if (templateSupersetIndex === -1) {
      return res.status(404).json({ message: 'Superset not found in template' })
    }

    const templateWorkoutItem = template.templateWorkout[templateSupersetIndex]

    if ((templateWorkoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const templateExercise = await TemplateExercise.findById(exerciseId)

    if (!templateExercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    if (
      !(templateWorkoutItem as any).components.some(
        (components: any) => components.toString() === exerciseId,
      )
    ) {
      return res.status(400).json({ message: 'Exercise is not linked to this superset' })
    }

    const remainingTemplateExerciseIds = (templateWorkoutItem as any).components.filter(
      (component: any) => component.toString() !== exerciseId,
    )

    if (remainingTemplateExerciseIds.length <= 1) {
      const dissolvedTemplateExerciseIds = [
        ...remainingTemplateExerciseIds.map((id: any) => String(id)),
        String(templateExercise._id),
      ]

      const dissolvedTemplateExercises = await TemplateExercise.find({
        _id: { $in: dissolvedTemplateExerciseIds },
      })

      const orderedDissolvedTemplateExercises = dissolvedTemplateExercises.sort(
        (a, b) =>
          dissolvedTemplateExerciseIds.indexOf(String(a._id)) -
          dissolvedTemplateExerciseIds.indexOf(String(b._id)),
      )

      const newTemplateWorkoutItemsData = orderedDissolvedTemplateExercises.map(
        (templateExercise) => ({
          type: 'exercise',
          name: templateExercise.name,
          components: [templateExercise._id],
        }),
      )

      const createdTemplateWorkoutItems = await TemplateWorkoutItem.insertMany(
        newTemplateWorkoutItemsData,
      )

      const createdTemplateWorkoutItemIds = createdTemplateWorkoutItems.map((item) => item._id)

      template.templateWorkout.splice(
        templateSupersetIndex,
        1,
        ...(createdTemplateWorkoutItemIds as any),
      )

      await template.save()

      await TemplateWorkoutItem.findByIdAndDelete(supersetId)

      const populatedTemplateWorkoutItems = await TemplateWorkoutItem.find({
        _id: { $in: createdTemplateWorkoutItemIds },
      }).populate('components')

      return res.status(200).json(populatedTemplateWorkoutItems)
    }

    ;(templateWorkoutItem as any).components = remainingTemplateExerciseIds

    const newTemplateWorkoutItem = new TemplateWorkoutItem({
      type: 'exercise',
      name: templateExercise.name,
      components: [templateExercise._id],
    })

    const savedTemplateWorkoutItem = await newTemplateWorkoutItem.save()

    template.templateWorkout.splice(
      templateSupersetIndex + 1,
      0,
      savedTemplateWorkoutItem._id as any,
    )

    await template.save()

    await (templateWorkoutItem as any).save()

    const updatedTemplateSuperset = await (templateWorkoutItem as any).populate('components')

    res.status(200).json(updatedTemplateSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlink superset exercise' })
  }
}

async function linkCurrentSupersetExercises(req: Request, res: Response) {
  try {
    const { templateId, supersetId, exerciseId } = req.params

    const template = await Template.findById(templateId).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateWorkoutItem = template.templateWorkout.find(
      (item: any) => item._id.toString() === supersetId,
    )

    if (!templateWorkoutItem) {
      return res.status(404).json({ message: 'Superset not found in template' })
    }

    if ((templateWorkoutItem as any).type !== 'superset') {
      return res.status(400).json({ message: 'Workout item is not a superset' })
    }

    const templateExercise = await TemplateExercise.findById(exerciseId)

    if (!templateExercise) {
      return res.status(404).json({ message: 'Exercise not found' })
    }

    if (
      (templateWorkoutItem as any).components.some(
        (component: any) => component.toString() === exerciseId,
      )
    ) {
      return res.status(400).json({ message: 'Exercise is already linked to this superset' })
    }

    const linkedTemplateWorkoutItem = template.templateWorkout.find(
      (item: any) =>
        item._id.toString() !== supersetId &&
        item.type === 'exercise' &&
        item.components.some((component: any) => component.toString() === exerciseId),
    )

    if (!linkedTemplateWorkoutItem) {
      return res.status(404).json({
        message: 'Workout item not found in template',
      })
    }

    template.templateWorkout = template.templateWorkout.filter(
      (item: any) => item._id.toString() !== linkedTemplateWorkoutItem._id.toString(),
    )
    ;(templateWorkoutItem as any).components.push(templateExercise._id)

    await template.save()

    await (templateWorkoutItem as any).save()

    await TemplateWorkoutItem.findByIdAndDelete(linkedTemplateWorkoutItem._id)

    const updatedTemplateSuperset = await (templateWorkoutItem as any).populate('components')

    res.status(200).json(updatedTemplateSuperset)
  } catch (error) {
    res.status(500).json({ message: 'Failed to link superset exercise' })
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
