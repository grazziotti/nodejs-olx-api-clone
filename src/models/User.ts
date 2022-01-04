import { Schema, model, connection } from "mongoose";

export interface UserInterface {
    _id: string
    name: string,
    email: string,
    state: string,
    passwordHash: string,
}

declare global {
    namespace Express { interface User extends UserInterface { _id: string } }
}

const schema = new Schema<UserInterface>({
    name: String,
    email: String,
    state: String,
    passwordHash: String,
})

const modelName: string = 'User'

export const User = connection && connection.models[modelName]
    ?   connection.models[modelName]
    :   model<UserInterface>(modelName, schema)
 