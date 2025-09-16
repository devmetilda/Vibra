# 🎉 Vibra - Campus Event Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing campus events. Students can discover and register for events, while administrators can create and manage events.

## ✨ Features

### 🌐 Public Features
- Browse all campus events
- View event details and information
- Event calendar view
- Search and filter events by category
- Responsive design for all devices

### 👨‍🎓 Student Features
- User registration and authentication
- Personal dashboard with registered events
- Event registration and unregistration
- Profile management
- Event notifications

### 👨‍💼 Admin Features
- Admin dashboard with analytics
- Create, edit, and delete events
- Manage event registrations
- View all users and their registrations
- Event management tools

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **CSS3** - Styling (preserving original design)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vibra-event-management
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   npm run install-server

   # Install client dependencies
   npm run install-client
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp server/.env.example server/.env
   ```

4. **Configure Environment Variables**
   Edit `server/.env` with your settings:
   ```env
   MONGO_URI=mongodb://localhost:27017/vibra-events
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the Application**
   ```bash
   # Start both client and server concurrently
   npm run dev

   # Or start them separately:
   # Terminal 1 - Start server
   npm run server

   # Terminal 2 - Start client
   npm run client
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
vibra-event-management/
├── client/                 # React frontend
│   ├── public/
│   │   └── assets/        # Images and static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── App.js
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js         # Entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

- **Registration**: Users can create accounts with email and password
- **Login**: Authenticate with email and password
- **Protected Routes**: Certain pages require authentication
- **Role-based Access**: Different features for students and admins

### Default Admin Account
After setting up the database, you can create an admin account by:
1. Registering a normal user account
2. Manually updating the user's role to 'admin' in MongoDB

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register` - Unregister from event

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/registered-events` - Get user's registered events
- `GET /api/users/dashboard-stats` - Get dashboard statistics

## 🎨 Design

The application preserves the exact design from the original HTML/CSS implementation:

- **Color Scheme**: Beige/brown theme (#D5C7A3, #C7BFB2)
- **Typography**: Island Moments, Georgia, Inspiration fonts
- **Layout**: Responsive design with mobile-first approach
- **Components**: Identical styling to original static pages

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the client: `cd client && npm run build`
2. Deploy the `build` folder to your hosting service

### Backend (Heroku/Railway)
1. Set environment variables on your hosting platform
2. Deploy the `server` folder
3. Update `CLIENT_URL` in environment variables

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Update `MONGO_URI` in environment variables
3. Whitelist your deployment IP addresses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**devmetilda** - [sequierametilda@gmail.com](mailto:sequierametilda@gmail.com)

---

**Vibra** - Your gateway to campus events! 🎓✨
