import { User, UserInterface } from "../models/User"
import bccrypt from 'bcrypt'

export const findById = async (id: string) => {
    return await User.findById(id)
}

export const findByEmail = async (email: string): Promise<UserInterface> => {
    return await User.findOne({ email })
}

export const createUser = async (name: string, email: string, state: string, password: string): Promise<UserInterface | Error>  => {
    const hasUser = await User.findOne({ email })

    if (!hasUser) {
        const hash = bccrypt.hashSync(password, 10)

        const newUser = await User.create({
            name,
            email,
            state,
            passwordHash: hash
        })

        return newUser
    }

    return new Error('E-mail já cadastrado')
}

export const updateUser = async (userId: string, updates: object) => {
    await User.findByIdAndUpdate(userId, updates)
}

export const matchPassword = (passwordText: string, encrypted: string) => {
    return bccrypt.compareSync(passwordText, encrypted)
}
