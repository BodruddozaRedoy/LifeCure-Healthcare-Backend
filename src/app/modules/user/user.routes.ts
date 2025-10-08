import express from 'express'
import { UserController } from './user.controller'
import { fileUploader } from '../../helpers/fileUploader'

const router = express.Router()

router.post("/create-patient", fileUploader.upload.single("file"), UserController.createPatient)

export const userRoutes = router