import express from 'express'
import { knowledgeTestValidation } from '~/validations/knowledgeTestValidation'
import { knowledgeTestController } from '~/controllers/knowledgeTestController'

const Router = express.Router()

Router.route('/')
  .post(knowledgeTestValidation.createTest, knowledgeTestController.createTest)
  .get(knowledgeTestValidation.getTests, knowledgeTestController.getTests)

// Get detail and delete
Router.route('/:id')
  .get(knowledgeTestValidation.getTestById, knowledgeTestController.getTestById)
  .put(knowledgeTestValidation.updateTest, knowledgeTestController.updateTest)
  .delete(knowledgeTestValidation.deleteTest, knowledgeTestController.deleteTest)

//Router.route('/heritage/:heritageId')
//    .get(knowledgeTestController.getTestsByHeritage)

// Test attempt
Router.route('/:id/attempt')
  .post(knowledgeTestController.submitAttempt)

//Router.route('/:id/leaderboard')
//    .get(knowledgeTestController.getLeaderboard)

// Update basic info
Router.route('/:id/basic-info')
  .put(knowledgeTestValidation.updateBasicInfo, knowledgeTestController.updateBasicInfo)

// Manage questions
Router.route('/:testId/questions')
  .get(knowledgeTestValidation.getQuestions, knowledgeTestController.getQuestions)
  .post(knowledgeTestValidation.addQuestion, knowledgeTestController.addQuestion)

// Manage a specific question
Router.route('/:testId/questions/:questionId')
  .get(knowledgeTestValidation.getQuestionById, knowledgeTestController.getQuestionById)
  .put(knowledgeTestValidation.updateQuestion, knowledgeTestController.updateQuestion)
  .delete(knowledgeTestValidation.deleteQuestion, knowledgeTestController.deleteQuestion)

// Manage options of a question
Router.route('/:testId/questions/:questionId/options')
  .get(knowledgeTestValidation.getOptions, knowledgeTestController.getOptions)
  .post(knowledgeTestValidation.addOption, knowledgeTestController.addOption)

// Manage a specific option
Router.route('/:testId/questions/:questionId/options/:optionId')
  .put(knowledgeTestValidation.updateOption, knowledgeTestController.updateOption)
  .delete(knowledgeTestValidation.deleteOption, knowledgeTestController.deleteOption)

export const knowledgeTestRoute = Router