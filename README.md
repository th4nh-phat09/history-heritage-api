# History Heritage API

A Node.js backend service for the Vietnam Heritage application.

## Project Structure
```
history-heritage-api/
├── src/
│   ├── config/              # Configuration files
│   │   ├── cors.js         # CORS configuration
│   │   ├── environment.js  # Environment variables
│   │   └── mongodb.js      # Database configuration
│   ├── controllers/        # Request handlers
│   │   ├── chatRoomController.js
│   │   ├── heritageController.js
│   │   ├── knowledgeTestController.js
│   │   └── userController.js
│   ├── middlewares/       # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandlingMiddleware.js
│   ├── models/           # Database models
│   │   ├── ChatRoomModel.js
│   │   ├── HeritageModel.js
│   │   └── UserModel.js
│   ├── routes/          # API routes
│   │   └── v1/         # API version 1
│   ├── sockets/        # Socket.io handlers
│   ├── utils/          # Utility functions
│   └── server.js       # Application entry point
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Email Service**: Nodemailer
- **File Upload**: Multer
- **Input Validation**: Express Validator

## Features

1. **Heritage Management**
   - CRUD operations for heritage sites
   - Image upload and management
   - Search and filtering
   - Pagination support

2. **User System**
   - Authentication & Authorization
   - User profile management
   - Role-based access control
   - Password reset functionality

3. **Chat System**
   - Real-time chat rooms
   - Message persistence
   - User presence tracking
   - Chat history

4. **Knowledge Testing**
   - Quiz management
   - Score tracking
   - Leaderboard system
   - Progress monitoring

5. **Email Notifications**
   - Registration confirmation
   - Password reset
   - System notifications

## Getting Started

1. **Installation**
```bash
npm install
```

2. **Environment Setup**
Create a `.env` file based on `.env.example`:
```env
MONGODB_URI=your_mongodb_uri
DATABASE_NAME=your_database_name
LOCAL_APP_HOST='0.0.0.0'
LOCAL_APP_PORT=8017
WEBSITE_DOMAIN_DEVELOPMENT='http://localhost:5173/'
WEBSITE_DOMAIN_PRODUCTION='http://localhost'
GMAIL_USER=your_gmail
GMAIL_PASSWORD=your_app_password
ACCESS_TOKEN_SECRET_SIGNATURE=your_access_token_secret
REFRESH_TOKEN_SECRET_SIGNATURE=your_refresh_token_secret
```

3. **Development**
```bash
npm run dev
```

4. **Production**
```bash
npm run build
npm start
```

## API Endpoints

### Heritage Routes
- `GET /v1/heritages` - Get all heritage sites
- `POST /v1/heritages` - Create new heritage
- `GET /v1/heritages/:id` - Get heritage by ID
- `PUT /v1/heritages/:id` - Update heritage
- `DELETE /v1/heritages/:id` - Delete heritage

### User Routes
- `POST /v1/users/register` - Register new user
- `POST /v1/users/login` - User login
- `GET /v1/users/profile` - Get user profile
- `PUT /v1/users/profile` - Update profile

### Knowledge Test Routes
- `GET /v1/knowledge-tests` - Get all tests
- `POST /v1/knowledge-tests/submit` - Submit test
- `GET /v1/leaderBoards` - Get leaderboard

### Chat Routes
- `GET /v1/chat/rooms` - Get chat rooms
- `POST /v1/chat/messages` - Send message
- `GET /v1/chat/history` - Get chat history

## Socket.IO Events

- `connection` - Client connected
- `disconnect` - Client disconnected
- `joinRoom` - Join chat room
- `leaveRoom` - Leave chat room
- `message` - New message
- `typing` - User typing indicator

## Error Handling

The API uses a centralized error handling middleware that:
- Catches all errors
- Formats error responses
- Logs errors appropriately
- Sends proper HTTP status codes

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Create Pull Request

## License

This project is licensed under the MIT License.