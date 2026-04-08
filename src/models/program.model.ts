import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
    weight: Number,
    reps: Number,
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
    type: { type: String, default: "exercise" },
    name: String,
    sets: [setSchema],
}, { _id: true });

const workoutItemSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["exercise", "superset"],
    },
    name: String,

    sets: [setSchema],

    exercises: [exerciseSchema],
}, { _id: true });

const programSchema = new mongoose.Schema({
    name: String,
    workout: [workoutItemSchema],
    date: Date,
});

const Program = mongoose.model('Program', programSchema);

export { Program };