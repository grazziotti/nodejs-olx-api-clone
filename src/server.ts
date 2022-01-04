import express from 'express'
import { ErrorRequestHandler } from 'express'
import dotenv from 'dotenv'
import path from 'path'
import ApiRoutes from './routes/apiRoutes'
import cors from 'cors'
import passport from 'passport'
import { mongoConnect } from './database/mongo'
import { MulterError } from 'multer'

dotenv.config()

mongoConnect()

const server = express()

server.use(cors())

server.use(passport.initialize())

server.use(express.urlencoded({ extended: true }))
server.use(express.static(path.join(__dirname, '../public')))

server.use(ApiRoutes)

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof MulterError) {
        res.json({ error: err.code })
        return
    }
    if (err.status) {
        res.json({ error: err.message })
        return
    }   

    console.log(err)
    res.json({ error: 'Ocorreu algum erro' })
}
server.use(errorHandler)

server.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado.'})
})

server.listen(process.env.PORT)