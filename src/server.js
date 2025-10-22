import express from 'express'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb.js'
import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import { APIs_V1 } from './routes/v1/index.js'
import { env } from '~/config/environment'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from '~/config/cors'
import { Server } from 'socket.io'
import { createServer as createHttpServer } from 'http'
import { createServer as createHttpsServer } from 'https'
import { registerSockets } from '~/sockets/index.js'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
const START_SERVER = () => {
  const app = express()

  // Disable X-Powered-By header ngay từ đầu
  app.disable('x-powered-by')

  // Sử dụng process.cwd() để trỏ về gốc project (Babel vẫn hiểu)
  const keyPath = path.join(process.cwd(), 'src', 'cert', 'key.pem')
  const certPath = path.join(process.cwd(), 'src', 'cert', 'cert.pem')

  // Kiểm tra tồn tại file chứng chỉ
  let server
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }

    // Tạo server HTTPS
    server = createHttpsServer(options, app)
    console.log('HTTPS mode enabled (using self-signed certificate)')
  } else {
    // Nếu chưa có chứng chỉ thì fallback về HTTP
    server = createHttpServer(app)
    console.warn('SSL certificate not found. Running in HTTP mode.')
  }

  // Khởi tạo Socket.IO
  const io = new Server(server, {
    cors: corsOptions
  })

  registerSockets(io)
  console.log('Socket.IO registered')

  // Tạo thư mục uploads nếu chưa tồn tại
  const uploadsDir = path.join(process.cwd(), 'Uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
  }

  // Cấu hình middleware
  // Cấu hình Helmet.js để ẩn server information
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: 'deny' }, // X-Frame-Options: DENY
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        frameAncestors: ["'none'"], // frame-ancestors 'none'
        frameSrc: ["'self'"],
        objectSrc: ["'none'"]
      }
    },
    // KHẮC PHỤC LỖI STRICT-TRANSPORT-SECURITY 
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true, // Apply to all subdomains
      preload: true // Enable HSTS preload (submit to browser preload lists)
    },
    // Ẩn thông tin server và technology stack
    hidePoweredBy: true, // Ẩn X-Powered-By (backup cho app.disable)
    xssFilter: true, // X-XSS-Protection
    noSniff: true, // X-Content-Type-Options: nosniff
  }))
  
  // Middleware custom để đảm bảo remove tất cả server info headers
  app.use((req, res, next) => {
    // Remove hoặc override các headers tiết lộ thông tin server
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')
  
    next()
  })
  
  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Static file cho thư mục Uploads
  const __dirname = path.resolve()
  app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')))

  // Định tuyến API
  app.use('/v1', APIs_V1)

  // Xử lý lỗi
  app.use(errorHandlingMiddleware)

  // Lắng nghe server (HTTPS hoặc HTTP tùy trường hợp)
  const protocol = fs.existsSync(keyPath) ? 'https' : 'http'
  server.listen(env.LOCAL_APP_PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at ${protocol}://localhost:${env.LOCAL_APP_PORT}`)
  })

  console.log(`Build mode: ${env.BUILD_MODE}`)
  exitHook(() => {
    console.log('Disconnecting database connection...')
    CLOSE_DB()
    console.log('Disconnected database connection.')
  })
}

// Kết nối database rồi khởi động server
;(async () => {
  try {
    console.log('Connecting to database...')
    await CONNECT_DB()
    console.log('Connected to database.')
    START_SERVER()
  } catch (error) {
    console.error('Error connecting to database:', error)
    process.exit(0)
  }
})()
