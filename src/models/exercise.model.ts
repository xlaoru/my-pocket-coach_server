import mongoose from "mongoose";

export const setSchema = new mongoose.Schema({
  weight: Number,
  reps: Number,
}, { _id: false });

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: [setSchema],
});

export const Exercise = mongoose.model("Exercise", exerciseSchema);