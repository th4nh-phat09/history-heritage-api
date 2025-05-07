import express from 'express'
import path from 'path'
import multer from 'multer'
import { commentController } from '~/controllers/commentController'
import { authMiddlewares } from '~/middlewares/authMiddeware'
import { commentValidation } from '~/validations/commentValidation'
import { env } from '~/config/environment'
import fs from 'fs'

const Router = express.Router()

const __dirname = path.resolve()

// Configure multer storage for comment images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'Uploads/comments')
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${Date.now()}${extname}`)
  }
})

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp|gif|bmp|tiff/
  const mimetypes = /image\/jpe?g|image\/png|image\/webp|image\/gif|image\/bmp|image\/tiff/

  const extname = path.extname(file.originalname).toLowerCase()
  const mimetype = file.mimetype

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Images only'), false)
  }
}

const upload = multer({ storage, fileFilter })
const uploadMultipleImages = upload.array('images', 5) // Limit to 5 images

// Get all comments (with pagination and filtering)
Router.route('/')
  .get(commentValidation.getAll, commentController.getAll)

// Create a new comment with image upload
Router.route('/')
  .post(
    authMiddlewares.authentication,
    uploadMultipleImages,
    (req, res, next) => {
      if (req.files && req.files.length > 0) {
        // Add the image paths to the request body
        req.body.images = req.files.map(file => `http://${env.LOCAL_APP_HOST}:${env.LOCAL_APP_PORT}/Uploads/comments/${file.filename}`)
      } else {
        req.body.images = []
      }
      next()
    },
    commentValidation.createNew,
    commentController.createNew
  )

// Get, update, delete, and like a comment by ID
Router.route('/:id')
  .get(commentValidation.getCommentById, commentController.getCommentById)
  .put(authMiddlewares.authentication, commentValidation.updateComment, commentController.updateComment)
  .delete(authMiddlewares.authentication, commentValidation.deleteComment, commentController.deleteComment)

// Like or unlike a comment
Router.route('/:id/like')
  .post(authMiddlewares.authentication, commentValidation.likeComment, commentController.likeComment)

export const commentRoute = Router