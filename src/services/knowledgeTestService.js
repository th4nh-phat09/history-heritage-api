import { knowledgeTestModel } from '~/models/knowledgeTestModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { leaderBoardModel } from '~/models/leaderBoardModel'
import { userModel } from '~/models/userModel'
import { heritageModel } from '~/models/heritageModel'

// Tạo bài test mới
const createNew = async (data) => {
    try {
        if (data.questions && data.questions.length > 0) {
            data.questions = data.questions.map(question => {
                const questionId = question.id || uuidv4()
                return {
                    ...question,
                    questionId: questionId,
                    options: question.options?.map(option => ({
                        ...option,
                        optionId: option.id || uuidv4()
                    })) || []
                }
            })
        }

        const createdTest = await knowledgeTestModel.createNew(data)
        const getNewTest = await knowledgeTestModel.findOneById(createdTest.insertedId)
        await leaderBoardModel.createNew({ heritageId: getNewTest.heritageId })

        return getNewTest
    } catch (error) {
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Error when creating new knowledge test'
        )
    }
}


const getTests = async (queryParams) => {
    try {
        const { page, limit, status } = queryParams
        const skip = (page - 1) * limit
        const filter = status === 'ALL' ? {} : { status }
        const { results, totalCount } = await knowledgeTestModel.findList({
            filter,
            skip,
            limit
        })

        return {
            results,
            totalCount,
            pagination: {
                totalItems: totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                itemsPerPage: limit
            }
        }
    } catch (error) {
        throw error
    }
}

// Lấy chi tiết một bài test theo id
const getTestById = async (id) => {
    try {
        const result = await knowledgeTestModel.findOneById(id)
        if (!result) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
        }
        return result
    } catch (error) {
        throw error
    }
}

// Cập nhật một bài test
const updateTest = async (id, data) => {
    try {
        const existingTest = await knowledgeTestModel.findOneById(id)
        if (!existingTest) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
        }

        const result = await knowledgeTestModel.updateOneById(id, data)
        return result
    } catch (error) {
        throw error
    }
}

// Xóa một bài test (soft delete)
const deleteTest = async (id) => {
    try {
        const existingTest = await knowledgeTestModel.findOneById(id)
        if (!existingTest)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        await knowledgeTestModel.deleteOneById(id)
        return {
            success: true,
            message: 'Xóa lựa chọn thành công'
        }
    } catch (error) {
        throw error
    }
}

// Lấy tất cả bài test của một di tích
const getTestsByHeritage = async (heritageId) => {
    try {
        const result = await knowledgeTestModel.findByHeritageId(heritageId)
        return result
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Lỗi khi lấy bài kiểm tra theo di tích')
    }
}

// Nộp bài làm
const submitAttempt = async (testId, data) => {
    try {
        const { userId, userName, answers } = data

        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        // Tính điểm
        let score = 0
        let totalQuestions = test.questions.length
        const result = answers
        // console.log(result)
        result.forEach(answer => {
            const question = test.questions.find(q => q.questionId.toString() === answer.questionId)
            if (!question) return
            const correctOptionIds = question.options
                .filter(option => option.isCorrect)

            const isCorrect = (correctOptionIds[0].optionId === answer.selectedOptionIds[0])

            if (isCorrect) score++
        })

        const finalScore = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0

        await knowledgeTestModel.updateTestStats(testId, userId, userName, finalScore)

        const user = await userModel.findOneById(userId)

        if (!user)
            throw new ApiError(StatusCodes.NOT_FOUND, new Error('User is not Found').message)

        // Cập nhật thống kê:
        user.stats.totalCompletedTests += 1

        const totalTests = user.stats.totalCompletedTests
        const prevAverage = user.stats.averageScore

        // Tính lại điểm trung bình mới:
        user.stats.averageScore = ((prevAverage * (totalTests - 1)) + finalScore) / totalTests

        await userModel.updateUser(userId, { stats: user.stats })

        const leaderBoard = await leaderBoardModel.findOneByHeritageId(test.heritageId)
        if (!leaderBoard)
            throw new ApiError(StatusCodes.NOT_FOUND, 'LeaderBoard is not found')
        const newUser = {
            userId,
            score: finalScore,
            avatar: user.avatar,
            displayName: user.displayname,
            completeDate: new Date()
        }

        // Tìm user trong bảng xếp hạng
        const existingIndex = leaderBoard.rankings.length > 0
            ? leaderBoard.rankings.findIndex(r => r.userId.toString() === userId.toString())
            : -1

        if (existingIndex !== -1) {
            // Nếu đã có và điểm mới cao hơn thì cập nhật
            const oldScore = leaderBoard.rankings[existingIndex].score
            if (finalScore > oldScore)
                leaderBoard.rankings[existingIndex] = newUser
            else return
        } else leaderBoard.rankings.push(newUser)

        // Sắp xếp lại thứ hạng theo điểm giảm dần
        leaderBoard.rankings.sort((a, b) => b.score - a.score)

        // Gán lại thứ hạng sau khi sort
        leaderBoard.rankings.forEach((entry, index) => { entry.rank = index + 1 })

        // Cập nhật thống kê
        leaderBoard.stats.totalParticipants = leaderBoard.rankings.length
        leaderBoard.stats.highestScore = leaderBoard.rankings[0]?.score || 0
        leaderBoard.stats.averageScore =
            leaderBoard.rankings.reduce((sum, entry) => sum + entry.score, 0) /
            leaderBoard.rankings.length

        await leaderBoardModel.update(leaderBoard._id, {
            rankings: leaderBoard.rankings,
            stats: leaderBoard.stats,
            updatedAt: new Date()
        })

        const topUsers = leaderBoard.rankings.slice(0, 10).map(user => ({
            userId: user.userId,
            userName: user.displayName
        }))
        const topScore = leaderBoard.rankings[0].score
        const totalParticipants = leaderBoard.rankings.length

        await heritageModel.updateOneById(test.heritageId, {
            leaderboardSummary: {
                topUsers,
                topScore: String(topScore),
                totalParticipants: String(totalParticipants)
            },
            updatedAt: Date.now()
        })

        return {
            score: finalScore,
            totalQuestions,
            correctAnswers: score
        }
    } catch (error) {
        // console.log(error)

        throw error
    }
}


// Lấy bảng xếp hạng
const getleaderboard = async (testId) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
        }

        return {
            testId: test._id,
            testTitle: test.title,
            stats: test.stats,
            topPerformers: test.topPerformers
        }
    } catch (error) {
        throw error
    }
}

const updateBasicInfo = async (testId, updateData) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
        }

        const result = await knowledgeTestModel.updateOneById(testId, {
            ...updateData,
            updatedAt: Date.now()
        })

        return result
    } catch (error) {
        throw error
    }
}

const getQuestions = async (testId) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)

        if (!test) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
        }

        return {
            testId: test._id,
            title: test.title,
            questions: test.questions || []
        }
    } catch (error) {
        throw error
    }
}

const addQuestion = async (testId, questionData) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
        const newQuestion = {
            ...questionData,
            questionId: uuidv4(),
            options: questionData.options.map(option => ({
                ...option,
                optionId: uuidv4()
            }))
        }
        if (!test.questions)
            test.questions = []
        test.questions.push(newQuestion)
        const updateData = {
            questions: test.questions,
            updatedAt: Date.now()
        }
        await knowledgeTestModel.updateOneById(testId, updateData)
        return newQuestion
    } catch (error) { throw error }
}

const getQuestionById = async (testId, questionId) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')
        const question = test.questions?.find(q => q.questionId === questionId)
        if (!question)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi')
        return {
            testId: test._id,
            testTitle: test.title,
            question: {
                id: question.id,
                content: question.content,
                explanation: question.explanation,
                image: question.image,
                options: question.options || []
            }
        }
    } catch (error) {
        throw error
    }
}

const updateQuestion = async (testId, questionId, updateData) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)

        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        const questionIndex = test.questions?.findIndex(q => q.questionId === questionId)

        if (questionIndex === -1 || questionIndex === undefined)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi')

        let updatedQuestion = { ...test.questions[questionIndex] }

        Object.keys(updateData).forEach(key => {
            if (key === 'options') {
                updatedQuestion.options = updateData.options.map(option => {
                    if (!option.id) {
                        return {
                            ...option,
                            optionId: uuidv4()
                        }
                    }
                    return option
                })
            } else {
                updatedQuestion[key] = updateData[key]
            }
        })

        test.questions[questionIndex] = updatedQuestion

        const updateDataForTest = {
            questions: test.questions,
            updatedAt: Date.now()
        }

        await knowledgeTestModel.updateOneById(testId, updateDataForTest)

        return updatedQuestion
    } catch (error) {
        throw error
    }
}




const deleteQuestion = async (testId, questionId) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        const questionExists = test.questions?.some(q => q.questionId === questionId)
        if (!questionExists)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi')

        const updatedQuestions = test.questions.filter(q => q.questionId !== questionId)
        const updateData = {
            questions: updatedQuestions,
            updatedAt: Date.now()
        }
        await knowledgeTestModel.updateOneById(testId, updateData)
        return {
            success: true,
            message: 'Xóa câu hỏi thành công'
        }
    } catch (error) { throw error }
}

const getOptions = async (testId, questionId) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        const question = test.questions?.find(q => q.questionId === questionId)
        if (!question)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi')

        return {
            testId: test._id,
            questionId: question.questionId,
            questionContent: question.content,
            options: question.options || []
        }
    } catch (error) {
        throw error
    }
}

const addOption = async (testId, questionId, optionData) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        const questionIndex = test.questions?.findIndex(q => q.questionId === questionId)
        if (questionIndex === -1 || questionIndex === undefined)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi')

        const newOption = {
            ...optionData,
            optionId: uuidv4()
        }
        test.questions[questionIndex].options.push(newOption)

        const updateData = {
            options: test.questions[questionIndex].options,
            updatedAt: Date.now(),
            questionId,
            optionId: newOption.optionId
        }


        await knowledgeTestModel.updateOneById(testId, updateData)
        return newOption
    } catch (error) {
        throw error
    }
}

const updateOption = async (testId, questionId, optionId, optionData) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        const questionIndex = test.questions?.findIndex(q => q.questionId === questionId)
        if (questionIndex === -1 || questionIndex === undefined)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi')

        const optionIndex = test.questions[questionIndex].options?.findIndex(o => o.optionId === optionId)
        if (optionIndex === -1 || optionIndex === undefined)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy lựa chọn')

        if (optionData.isCorrect === false) {
            const hasCorrectOption = test.questions[questionIndex].options.some(o => o.isCorrect === true && o.optionId !== optionId)
            if (!hasCorrectOption)
                throw new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, 'Câu hỏi phải có ít nhất một đáp án đúng')
        }
        test.questions[questionIndex].options[optionIndex] = {
            ...test.questions[questionIndex].options[optionIndex],
            ...optionData
        }

        const updateData = {
            options: test.questions[questionIndex].options,
            updatedAt: Date.now(),
            questionId,
            optionId: optionId
        }
        await knowledgeTestModel.updateOneById(testId, updateData)
        return test.questions[questionIndex].options[optionIndex]
    } catch (error) {
        throw error
    }
}

const deleteOption = async (testId, questionId, optionId) => {
    try {
        const test = await knowledgeTestModel.findOneById(testId)
        if (!test)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bài kiểm tra')

        const questionIndex = test.questions?.findIndex(q => q.questionId === questionId)
        if (questionIndex === -1 || questionIndex === undefined)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi')

        const optionExists = test.questions[questionIndex].options?.some(o => o.optionId === optionId)
        if (!optionExists)
            throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy lựa chọn')

        const updatedOptions = test.questions[questionIndex].options.filter(o => o.optionId !== optionId)
        // Xóa option
        const updateData = {
            options: updatedOptions,
            updatedAt: Date.now(),
            questionId,
            optionId
        }

        await knowledgeTestModel.updateOneById(testId, updateData)
        return {
            success: true,
            message: 'Xóa lựa chọn thành công'
        }
    } catch (error) {
        throw error
    }
}


export const knowledgeTestService = {
    createNew,
    getTests,
    getTestById,
    updateTest,
    deleteTest,
    getTestsByHeritage,
    submitAttempt,
    getleaderboard,
    updateBasicInfo,
    getQuestions,
    addQuestion,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    getOptions,
    addOption,
    updateOption,
    deleteOption
}