import { Schema, model, connection } from "mongoose";

export type StateType = {
    _id: string,
    name: string
}

const schema = new Schema<StateType>({
    name: { type: String, required: true }
})

const modelName: string = 'State'

export const State = connection && connection.models[modelName]
    ?   connection.models[modelName]
    :   model<StateType>(modelName, schema)