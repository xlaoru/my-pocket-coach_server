import { Request, Response } from 'express'
import { Template } from '../models/template.model'
import { TemplateExercise } from '../models/templateExercise.model'
import { TemplateWorkoutItem } from '../models/templateWorkoutItem.model'

async function getTemplates(req: Request, res: Response) {
  try {
    const templates = await Template.find()
      .sort({ _id: -1 })
      .populate({
        path: 'templateWorkout',
        populate: {
          path: 'components',
        },
      })

    res.status(200).json(templates)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch templates' })
  }
}

async function getTemplateById(req: Request, res: Response) {
  try {
    const { id } = req.params

    const template = await Template.findById(id).populate({
      path: 'templateWorkout',
      populate: {
        path: 'components',
      },
    })

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    res.status(200).json(template)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch template' })
  }
}

async function createTemplate(req: Request, res: Response) {
  try {
    const { name, description } = req.body

    const newTemplate = new Template({
      name,
      description,
    })

    const savedTemplate = await newTemplate.save()

    res.status(201).json(savedTemplate)
  } catch (error) {
    res.status(500).json({ message: 'Failed to create template' })
  }
}

async function editTemplateName(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { name } = req.body

    const template = await Template.findById(id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    template.name = name || template.name

    const updatedTemplate = await template.save()

    res.status(200).json(updatedTemplate)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit template name' })
  }
}

async function editTemplateDescription(req: Request, res: Response) {
  try {
    const { id } = req.params

    const { description } = req.body

    const template = await Template.findById(id)

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    template.description = description || template.description

    const updatedTemplate = await template.save()

    res.status(200).json(updatedTemplate)
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit template description' })
  }
}

async function deleteTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params

    const template = await Template.findById(id).populate('templateWorkout')

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    const templateExerciseIds = template.templateWorkout.flatMap((item: any) => item.components)

    const templateWorkoutItemIds = template.templateWorkout.map((item: any) => item._id ?? item)

    await TemplateExercise.deleteMany({ _id: { $in: templateExerciseIds } })

    await TemplateWorkoutItem.deleteMany({ _id: { $in: templateWorkoutItemIds } })

    await Template.findByIdAndDelete(id)

    res.status(200).json({ message: 'Template deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete template' })
  }
}

export {
  createTemplate,
  deleteTemplate,
  editTemplateDescription,
  editTemplateName,
  getTemplateById,
  getTemplates,
}
