import { StatusCodes } from 'http-status-codes'
import { knowledgeTestService } from '~/services/knowledgeTestService'
import { ApiError } from '~/utils/ApiError'

const createTest = async (req, res, next) => {
  try {
    const result = await knowledgeTestService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const getTests = async (req, res, next) => {
  try {
    const result = await knowledgeTestService.getTests(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTestById = async (req, res, next) => {
  try {
    const testId = req.params.id
    const result = await knowledgeTestService.getTestById(testId)
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
    }
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateTest = async (req, res, next) => {
  try {
    const testId = req.params.id
    const result = await knowledgeTestService.updateTest(testId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteTest = async (req, res, next) => {
  try {
    const testId = req.params.id
    const result = await knowledgeTestService.deleteTest(testId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTestsByHeritage = async (req, res, next) => {
  try {
    const heritageId = req.params.heritageId
    const result = await knowledgeTestService.getTestsByHeritage(heritageId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const submitAttempt = async (req, res, next) => {
  try {
    const testId = req.params.id
    // console.log("testId", req.body.answers)
    const result = await knowledgeTestService.submitAttempt(testId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getLeaderboard = async (req, res, next) => {
  try {
    const testId = req.params.id
    const result = await knowledgeTestService.getLeaderboard(testId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateBasicInfo = async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await knowledgeTestService.updateBasicInfo(id, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}


const getQuestions = async (req, res, next) => {
  try {
    const { testId } = req.params
    const result = await knowledgeTestService.getQuestions(testId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getQuestionById = async (req, res, next) => {
  try {
    const { testId, questionId } = req.params
    const result = await knowledgeTestService.getQuestionById(testId, questionId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const addQuestion = async (req, res, next) => {
  try {
    const { testId } = req.params
    const result = await knowledgeTestService.addQuestion(testId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const updateQuestion = async (req, res, next) => {
  try {
    const { testId, questionId } = req.params
    const result = await knowledgeTestService.updateQuestion(testId, questionId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteQuestion = async (req, res, next) => {
  try {
    const { testId, questionId } = req.params
    const result = await knowledgeTestService.deleteQuestion(testId, questionId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getOptions = async (req, res, next) => {
  try {
    const { testId, questionId } = req.params
    const result = await knowledgeTestService.getOptions(testId, questionId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const addOption = async (req, res, next) => {
  try {
    const { testId, questionId } = req.params
    const result = await knowledgeTestService.addOption(testId, questionId, req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) {
    next(error)
  }
}

const updateOption = async (req, res, next) => {
  try {
    const { testId, questionId, optionId } = req.params
    const result = await knowledgeTestService.updateOption(testId, questionId, optionId, req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteOption = async (req, res, next) => {
  try {
    const { testId, questionId, optionId } = req.params
    const result = await knowledgeTestService.deleteOption(testId, questionId, optionId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
export const knowledgeTestController = {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  getTestsByHeritage,
  submitAttempt,
  getLeaderboard,
  updateBasicInfo,
  getQuestions,
  getQuestionById,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getOptions,
  addOption,
  updateOption,
  deleteOption
}