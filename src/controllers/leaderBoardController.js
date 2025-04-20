import { StatusCodes } from 'http-status-codes'
import { leaderBoardService } from '~/services/leaderBoardService'

const getAll = async (req, res, next) => {
  try {
    const result = await leaderBoardService.getAll(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const newUser = await leaderBoardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) {
    next(error)
  }
}

const getLeaderBoardById = async (req, res, next) => {
  try {
    const result = await leaderBoardService.getLeaderBoardById(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateLeaderBoard = async (req, res, next) => {
  try {
    const result = await leaderBoardService.updateLeaderBoard(req.params.id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteLeaderBoard = async (req, res, next) => {
  try {
    const result = await leaderBoardService.deleteLeaderBoard(req.params.id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getByHeritageId = async (req, res, next) => {
  try {
    const result = await leaderBoardService.getByHeritageId(req.params.heritageId, req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const leaderBoardController = {
  getAll,
  createNew,
  getLeaderBoardById,
  updateLeaderBoard,
  deleteLeaderBoard,
  getByHeritageId
}
