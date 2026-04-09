import mongoose from "mongoose";

const workoutItemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["exercise", "superset"],
        required: true,
    },
    name: String,
    components: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
    }],
});

export const WorkoutItem = mongoose.model("WorkoutItem", workoutItemSchema);
