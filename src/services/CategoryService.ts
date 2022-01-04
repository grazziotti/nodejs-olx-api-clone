import { Category, CategoryType } from "../models/Category"

export const all = async (): Promise<CategoryType[]> => {
    return await Category.find()
}

export const findCategory = async (data: object): Promise<CategoryType> => {
    return await Category.findOne(data)
}

export const findCategories = async (data: object): Promise<CategoryType[]> => {
    return await Category.find(data)
}

export const findById = async (categoryId: string): Promise<CategoryType> => {
    return await Category.findById(categoryId)
}