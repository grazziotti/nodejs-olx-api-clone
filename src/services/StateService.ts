import { State , StateType } from '../models/State'

export const all = async () => {
    return await State.find()
}

export const findById = async (stateId: string): Promise<StateType> => {
    return await State.findById(stateId)
}

export const findState = async (data: object): Promise<StateType> => {
    return await State.findOne(data)
}