import { Schema, model, connection } from "mongoose";

export type CategoryType = {
    _id: string,
    name: string,
    slug: string,
    _doc?: CategoryType
}

const schema = new Schema<CategoryType>({
    name: { type: String, required: true },
    slug: { type: String, required: true }
})

const modelName: string = 'Category'

export const Category = connection && connection.models[modelName]
    ?   connection.models[modelName]
    :   model<CategoryType>(modelName, schema)