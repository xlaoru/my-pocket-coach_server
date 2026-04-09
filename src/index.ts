import dotenv from "dotenv"
dotenv.config()

import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import mongoose from "mongoose"

import { programRouter } from "./routes/program.route"

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use("/api", programRouter)

const PORT = process.env.PORT || 3001

mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() => {
    console.log("Connected to DB")
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch(() => {
    console.log("Connection failed")
  })
