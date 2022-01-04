import { Request, Response } from 'express'
import { validationResult, matchedData } from "express-validator"
import dotenv from 'dotenv'

import * as UserService from '../services/UserService'

import { generateToken } from '../config/passport'

dotenv.config()

export const signIn = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
        const email = req.body.email as string
        const password  = req.body.password as string

        const user = await UserService.findByEmail(email)

        if (user && UserService.matchPassword(password, user.passwordHash)) {
            const token = generateToken({ id: user._id })

            res.json({ email: user.email, token })
            return
        } 

        res.json({ error: 'Email e/ou senha inválidos' })
        return
    } else {
        res.json({ errors: errors.mapped() })
        return
    }
}

export const signUp = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
        let { name, email, state, password } = matchedData(req)
        const newUser = await UserService.createUser(name, email, state, password)

        if (newUser instanceof Error) {
            res.json({ error: newUser.message })
            return
        }

        const token = generateToken({ id: newUser._id })
    
        res.json({ email: newUser.email, token })
        return
    }

    res.json({ errors: errors.mapped() })
}