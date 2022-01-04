import { Request, Response } from 'express'
import sharp from 'sharp'
import dotenv from 'dotenv'
import { unlink } from 'fs/promises'
import mongoose, { FilterQuery } from 'mongoose'

import * as AdService from '../services/AdService'
import * as CategoryService from '../services/CategoryService'
import * as StateService from '../services/StateService'
import * as UserService from '../services/UserService'

import { AdUpdateType } from '../services/AdService'

dotenv.config()

const deleteTmpImages = async (pathArr: string[]) => {
    pathArr.forEach( async path => await unlink(path))
}

export const getCategories = async (req: Request, res: Response) => {
    const cats = await CategoryService.all()

    const categories = cats.map( cat => {
        return { ...cat._doc, img: `${process.env.BASE}/assets/images/${cat.slug}.png` }
    })

    res.json({ categories })
}

export const addAction = async (req: Request, res: Response) => {
    let { title, price, priceneg, desc, cat } = req.body

    const files = req.files as Express.Multer.File[]
    const filePathArr = files.map( file => file.path)

    if (title && cat) {
        const user = req.user
        const category = await CategoryService.findCategory({ slug: cat })

        if (price) { 
            price = parseFloat(price.replace('.', '').replace(',', '.').replace('R$', ''))
        } else {
            price = 0
        }
        
        if (user) {
            if (category) {
                let images: {
                    url: string,
                    default: boolean
                }[] = []

                files.forEach( async file => {
                    await sharp(file.path)
                        .resize(500, 500)
                        .toFormat('jpeg')
                        .toFile(`./public/media/${file.filename}`)  
                    await unlink(file.path)  
                })
            
                files.forEach( file => images.push({url: file.filename, default: false}))

                if (images.length > 0) images[0].default = true

                if (priceneg) {
                    priceneg = priceneg === 'true' ? true: false
                }

                const newAd = await AdService.createAd({
                    status: true,
                    idUser: user._id,
                    state: user.state,
                    dateCreated: new Date(),
                    title,
                    category: category._id,
                    price,
                    priceNegotiable: priceneg,
                    description: desc,
                    views: 0,
                    images
                })

                res.json({ id: newAd._id })
                return
            }

            deleteTmpImages(filePathArr)
            res.json({ error: 'Categoria inexistente' })
            return
        }
    }
    
    deleteTmpImages(filePathArr)
    res.json({ error: 'Titulo e/ou categoria não foram preenchidos' })
}

export const getList = async (req: Request, res: Response) => {
    let { sort ='asc', offset = 0, limit = 8, q, cat, state } = req.query

    const filters: {
        status: true,
        title?: object,
        category?: string,
        state?: string
    } = {status: true}

    if (q) {
        filters.title = {'$regex': q, '$options': 'i'}
    }

    if (cat) {
        const c = await CategoryService.findCategory({slug: cat})
        if (c) {
            filters.category = c._id.toString()
        }
    }

    if (state) {
        state = state.toString().toUpperCase() 
        const s = await StateService.findState({name: state.toUpperCase()})
        if (s) {
            filters.state = s._id.toString()
        }
    }

    const adsData = await AdService.findAds(filters)
    const ads = adsData.map( ad => {
        let image: string = ''
        const defaultImg = ad.images.find( e => e.default)

        defaultImg 
            ? image = `${process.env.BASE}/media/${defaultImg.url}`
            : image = `${process.env.BASE}/media/default.jpg`

        return {
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            image
        }
    })

    res.json({ ads })
}

export const getItem = async (req: Request, res: Response) => {
    const id = req.params.id as string
    const other = req.query.other

    if (mongoose.Types.ObjectId.isValid(id)) {
        const ad = await AdService.findAd(id)
        if (ad) {
            let images = ad.images.map( (img: { url: string, default: boolean }) => {
                return `${process.env.BASE}/media/${img.url}`
            })

            const category = await CategoryService.findById(ad.category)
            const stateInfo = await StateService.findById(ad.state)
            const userInfo = await UserService.findById(ad.idUser)

            let others: {
                id: string,
                title: string,
                price: number,
                priceNegotiable: boolean,
                image: string
            }[] = []
            if (other) {
                const otherData = await AdService.findAds({ status: true, idUser: ad.idUser })

                others = otherData.map( data => {
                    let image: string = `${process.env.BASE}/media/default.jpg`

                    const defaultImg = data.images.find( (e: { url: string, default: boolean }) => e.default)
    
                    if (defaultImg) image = `${process.env.BASE}/media/${defaultImg.url}`

                    return {
                        id: data._id,
                        title: data.title,
                        price: data.price,
                        priceNegotiable: data.priceNegotiable,
                        image
                    }
                })
            }   

            await AdService.plusViews(ad._id)
            

            res.json({
                id: ad._id,
                title: ad.title,
                price: ad.price,
                pricenegotiable: ad.priceNegotiable,
                description: ad.description,
                dateCreated: ad.dateCreated,
                views: ad.views,
                images,
                category,
                userInfo: {
                    name: userInfo.name,
                    email: userInfo.email   
                },
                stateName: stateInfo.name,
                others
            })
            return
        }

        res.json({ error: 'Anúncio inexistente' })
        return
    }

    res.json({ error: 'ID inválido' })
    return
}

export const editAction = async (req: Request, res: Response) => {
    const id = req.params.id as FilterQuery<string>
    let { title, status, price, desc, priceneg, cat } = req.body

    const files = req.files as Express.Multer.File[]
    const filePathArr = files.map( file => file.path)

    if (mongoose.Types.ObjectId.isValid(id)) {

        const ad = await AdService.findAd(id)

        if (ad) {
            const user = req.user
            if (user !== undefined) {
                if (user._id.toString() === ad.idUser) {
                    let updates: AdUpdateType = {}

                    if (title) {
                        updates.title = title
                    }
                    if (price) {
                        price = price.replace('.', '').replace(',', '.').replace('R$', '')
                        price = parseFloat(price)
                        updates.price = price
                    }
                    if (priceneg) {
                        updates.priceNegotiable = priceneg
                    }
                    if (status) {
                        updates.status = status
                    }
                    if (desc) {
                        updates.description = desc
                    }
                    if (cat) {
                        const category = await CategoryService.findCategory({ slug: cat })
                        if (!category) {
                            res.json({ error: 'Categoria inexistente' })
                            return
                        }

                        updates.category = category._id.toString()
                    }

                    let images: {
                        url: string,
                        default: boolean
                    }[] = []
                    
                    files.forEach( async file => {
                        await sharp(file.path)
                            .resize(500, 500)
                            .toFormat('jpeg')
                            .toFile(`./public/media/${file.filename}`)  

                        await unlink(file.path)  
                    })

                    files.forEach( file => images.push({url: file.filename, default: false}))

                    if (images.length > 0) {
                        images[0].default = true
                        updates.images = images

                        const ad = await AdService.findAd(id)
                        ad.images.forEach( async img => {
                            const url = img.url
                            await unlink(`${__dirname}/../../public/media/${url}`)
                        })
                    }

                    await AdService.updateAd(id, updates)  
                    res.json({ status: true })
                    return
                }

                deleteTmpImages(filePathArr)
                res.json({ error: 'Este anúncio não é seu' })
                return
            }
        }
        
        deleteTmpImages(filePathArr)
        res.json({ error: 'Anúncio inexistente' })
        return
    }

    deleteTmpImages(filePathArr)
    res.json({ error: 'ID inválido' })      
}