import { StatusCodes } from 'http-status-codes'
import { heritageService } from '~/services/heritageService'

const getHeritages = async (req, res, next) => {
    try {
        const getHeritages = await heritageService.getHeritages(req.query)
        res.status(StatusCodes.OK).json(getHeritages)
    } catch (error) {
        next(error)
    }
}



export const heritageController = {
    getHeritages
}