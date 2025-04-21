import { StatusCodes } from 'http-status-codes'
import { favoriteService } from '~/services/favoriteService'

const getAll = async (req, res, next) => {
  try {
    const result = await favoriteService.getAll(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getFavoriteById = async (req, res, next) => {
  try {
    const result = await favoriteService.getFavoriteById(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const result = await favoriteService.update(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getByUserId = async (req, res, next) => {
  try {
    const result = await favoriteService.getByUserId(req.params.userId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const addToFavorites = async (req, res, next) => {
  try {
    const { userId, heritageId } = req.body
    const result = await favoriteService.addToFavorites(userId, heritageId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteFavoriteByHeritageId = async (req, res, next) => {
  try {
    const { userId, heritageId } = req.params
    const result = await favoriteService.deleteFavoriteByHeritageId(userId, heritageId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const favoriteController = {
  getAll,
  getFavoriteById,
  update,
  getByUserId,
  addToFavorites,
  deleteFavoriteByHeritageId
}
