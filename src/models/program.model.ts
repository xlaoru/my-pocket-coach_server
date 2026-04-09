import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
    name: String,
    description: String,
    date: Date,
    workout: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkoutItem",
    }],
});

export const Program = mongoose.model("Program", programSchema);