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

const createHeritage = async (req, res, next) => {
  try {
    const result = await heritageService.createHeritage(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const updateHeritage = async (req, res, next) => {
  try {
    const result = await heritageService.updateHeritage(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteHeritage = async (req, res, next) => {
  try {
    const result = await heritageService.deleteHeritage(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getHeritageDetail = async (req, res, next) => {
  try {
    const result = await heritageService.getHeritageDetail(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getHeritageBySlug = async (req, res, next) => {
  try {
    const result = await heritageService.getHeritageBySlug(req.params.nameSlug)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getNearestHeritages = async (req, res, next) => {
  try {
    const { latitude, longitude, limit } = req.query
    const result = await heritageService.getNearestHeritages(latitude, longitude, limit)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}


const getAllHeritageNames = async (req, res, next) => {
  try {
    const result = await heritageService.getAllHeritageNames(req.params.nameSlug)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}


export const heritageController = {
  getHeritages,
  createHeritage,
  updateHeritage,
  deleteHeritage,
  getHeritageDetail,
  getHeritageBySlug,
  getNearestHeritages,
  getAllHeritageNames
}