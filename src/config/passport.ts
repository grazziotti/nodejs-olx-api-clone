import passport from "passport"
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt'
import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'
import * as UserService from '../services/UserService'
import { Request, Response, NextFunction } from "express"

dotenv.config()

const notAuthorizedJson = { status: 403, message: 'Não autorizado.' }
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET as string
}

passport.use( new JWTStrategy(options, async (payload, done) => {
    const user = await UserService.findById(payload.id)
    return user ? done(null, user) : done(notAuthorizedJson, false)
}))  

export const generateToken = (data: object) => {
    return JWT.sign(
        data, 
        process.env.JWT_SECRET as string,
        { expiresIn: '5h' } 
    )
}

export const privateRoute = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', (err, user) => {
        req.user = user
        return user ? next() : next(notAuthorizedJson)
    })(req, res, next)
}

export default passport