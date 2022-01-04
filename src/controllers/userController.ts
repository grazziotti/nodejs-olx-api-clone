import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { validationResult, matchedData } from 'express-validator'
import bcrypt from 'bcrypt'

import * as StateService from '../services/StateService'
import * as AdService from '../services/AdService'
import * as UserService from '../services/UserService'
import * as CategoryService from '../services/CategoryService' 

export const getStates = async (req: Request, res: Response) => {
    const states = await StateService.all()
    res.json({ states })
}

export const info = async (req: Request, res: Response) => {
    const user = req.user
    if (user) {
        const state = await StateService.findById(user.state)
        const ads = await AdService.findAds({idUser: user._id.toString()})

        const adList = await Promise.all(ads.map( async ad => {
            const cat = await CategoryService.findById(ad.category)
            return { ...ad._doc, category: cat.slug}
        }))
        
        res.json({ 
            name: user.name,
            email: user.email,
            state: state.name,
            adList 
        })
        return
    }
}

export const editAction = async (req: Request, res: Response) => {
    const errors = validationResult(req)

    const user = req.user

    if (user) {
        if (errors.isEmpty()) {
            const data = matchedData(req)

            let updates: {
                name?: string,
                email?: string,
                state?: string,
                passwordHash?: string
            } = {}

            if (data.name) 
                updates.name = data.name as string
            
            if (data.email) {
                const emailCheck = await UserService.findByEmail(data.email)
                if (emailCheck) {
                    res.json({ error: 'E-mail já existente' })
                    return
                }

                updates.email = data.email
            }

            if (data.state) {
                if(mongoose.Types.ObjectId.isValid(data.state)) {
                    const stateCheck = await StateService.findById(data.state)
                    
                    if (stateCheck) {
                        updates.state = data.state
                    } else {
                        res.json({ error: 'Estado não existe' })
                        return
                    }
                }
            }

            if (data.password) 
                updates.passwordHash = await bcrypt.hash(data.password, 10)


            await UserService.updateUser(user._id, updates)

            res.json({  })
            return
        }
        
        res.json({ error: errors.mapped() })
        return
    }
}