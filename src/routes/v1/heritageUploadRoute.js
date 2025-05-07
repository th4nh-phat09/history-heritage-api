import express from 'express'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { env } from '~/config/environment'

const Router = express.Router()

const __dirname = path.resolve()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'Uploads/Heritages'))
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
const uploadSingleImage = upload.single('image')

Router.post('/', (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return res.status(400).send({ message: err.message })
    }

    if (req.file) {
      // Construct the image path and full URL
      const imagePath = `/Uploads/Heritages/${req.file.filename}`
      const imageUrl = `http://${env.LOCAL_APP_HOST}:${env.LOCAL_APP_PORT}${imagePath}` // e.g., http://localhost:8017/Uploads/avatar/image-123456.jpg

      return res.status(200).send({
        message: 'Image uploaded successfully',
        image: imagePath, // Relative path
        imageUrl // Full URL
      })
    } else {
      return res.status(400).send({ message: 'No image file provided' })
    }
  })
})


Router.delete('/', (req, res) => {
  const { image } = req.body

  if (!image) {
    return res.status(400).send({ message: 'Filename is required' })
  }

  // Construct the full file path on the server
  const filePath = path.join(__dirname, image)

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send({ message: 'File not found' })
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).send({ message: 'Failed to delete image' })
      }
      return res.status(200).send({ message: 'Image deleted successfully' })
    })
  })
})

export const heritageUploadRoute = Router