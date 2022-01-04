import { Schema, model, connection } from "mongoose";

export type AdType = {
    _id: string,
    idUser: string,
    state: string,
    category: string,
    images: {
        url: string,
        default: boolean
    }[],
    dateCreated: Date,
    title: string,
    price: number,
    priceNegotiable: boolean,
    description: string,
    views: number,
    status: boolean,
    _doc?: AdType 
}

const schema = new Schema<AdType>({
    idUser: { type: String, required: true },
    state: { type: String, required: true },
    category: { type: String, required: true },
    images: [{ url: String, default: Boolean }] ,
    dateCreated: { type: Date, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    priceNegotiable: Boolean,
    description: String,
    views: { type: Number, required: true },
    status: { type: Boolean, required: true }
})

const modelName: string = 'Ad'

export const Ad = connection && connection.models[modelName]
    ?   connection.models[modelName]
    :   model<AdType>(modelName, schema)