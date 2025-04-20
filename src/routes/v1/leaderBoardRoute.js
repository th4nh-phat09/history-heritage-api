import express from 'express'
import { leaderBoardController } from '~/controllers/leaderBoardController'
import { leaderBoardValidation } from '~/validations/leaderBoardValidation'


const Router = express.Router()

// get all, create
Router.route('/')
  .get(leaderBoardValidation.getAll, leaderBoardController.getAll)
  .post(leaderBoardValidation.createNew, leaderBoardController.createNew)

// get by heritageId with pagination
Router.route('/heritage/:heritageId')
  .get(leaderBoardValidation.getByHeritageId, leaderBoardController.getByHeritageId)

// get detail, update, and delete LeaderBoard
Router.route('/:id')
  .get(leaderBoardValidation.getLeaderBoardById, leaderBoardController.getLeaderBoardById)
  .put(leaderBoardValidation.updateLeaderBoard, leaderBoardController.updateLeaderBoard)
  .delete(leaderBoardValidation.deleteLeaderBoard, leaderBoardController.deleteLeaderBoard)

export const leaderBoardRoute = Router
