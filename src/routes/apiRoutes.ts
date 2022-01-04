import { Router } from "express"
import { Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuid } from 'uuid'

import { privateRoute } from '../config/passport'
import AuthValidator from '../validators/AuthValidator'
import UserValidator from "../validators/UserValidator"

import * as AdsController from '../controllers/adsController'
import * as AuthController from '../controllers/authController'
import * as UserController from '../controllers/userController'

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './tmp')
    },
    filename: (req, file, cb) => {
        const randomName = `${uuid()}.jpg`
        cb(null, randomName)
    }
})

const upload = multer({
    storage: storageConfig,
    fileFilter: (req, file, cb) => {
        const allowedImages = ['image/jpeg', 'image/jpg', 'image/png']
        cb(null, allowedImages.includes(file.mimetype))
    }
})

const router = Router()

router.get('/ping', (req: Request, res: Response) => {
    res.json({ pong: true })
})

router.get('/states', UserController.getStates)

router.post('/user/signin', AuthValidator.signIn, AuthController.signIn)
router.post('/user/signup', AuthValidator.signUp, AuthController.signUp)

router.get('/user/me', privateRoute, UserController.info)
router.put('/user/me', privateRoute, UserValidator.editAction, UserController.editAction)

router.get('/categories', AdsController.getCategories)

router.post('/ad/add', privateRoute, upload.array('images', 8), AdsController.addAction)
router.get('/ad/list', AdsController.getList)

router.get('/ad/:id', AdsController.getItem)
router.post('/ad/:id', privateRoute, upload.array('images', 8), AdsController.editAction)

export default router