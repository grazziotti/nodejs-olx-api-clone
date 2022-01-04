import { FilterQuery } from 'mongoose'
import { Ad, AdType } from '../models/Ad'

export type AdUpdateType = {
    title?: string,
    price?: number,
    priceNegotiable?: boolean,
    status?: string,
    description?: string,
    category?: string,
    images?: {
        url: string,
        default: boolean
    }[]
}


export const createAd = async (data: object): Promise<AdType> => {
    return await Ad.create(data)
}

export const updateAd = async (id: FilterQuery<string>, updates: AdUpdateType) => {
    await Ad.findOneAndUpdate({ _id: id }, { $set: updates })
}

export const findAd = async (userId: string): Promise<AdType> => {
    return await Ad.findById(userId)
}

export const findAds = async (data: object): Promise<AdType[]> => {
    return await Ad.find(data)
}

export const plusViews = async (id: string) => {
    const ad = await Ad.findById(id)
    ad.views++
    ad.save()
}