# CEA Rainfall Tracker

A comprehensive MERN stack application for the Government Environmental Agency (CEA) to track, manage, and share rainfall data. This system provides secure API access, role-based authentication, and a modern web interface for monitoring environmental data.

## 🌟 Features

### 🔐 Security & Authentication
- **API Key Authentication**: Secure access using unique API keys
- **Role-Based Access Control**: Admin and standard user roles
- **Input Sanitization**: Protection against XSS and injection attacks
- **Rate Limiting**: Prevents abuse with request throttling
- **Helmet Security**: HTTP security headers
- **CORS Protection**: Cross-origin request security

### 📊 Data Management
- **Real-time Rainfall Data**: Monitor rainfall from multiple stations
- **Historical Records**: Access historical rainfall data
- **Data Validation**: Comprehensive input validation
- **CSV Export**: Download data in CSV format
- **Search & Filter**: Advanced filtering and search capabilities

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all devices
- **Beautiful Interface**: Modern, clean design with TailwindCSS
- **Interactive Dashboard**: Real-time statistics and data visualization
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Smooth user experience

### 🔧 Technical Excellence
- **MERN Stack**: MongoDB, Express.js, React.js, Node.js
- **RESTful API**: Well-structured API endpoints
- **Comprehensive Logging**: Detailed request and error logging
- **Error Handling**: Robust error management
- **Code Quality**: Clean, maintainable code structure

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cea-rainfall-tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   yarn install
   # or npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   yarn install
   # or npm install
   ```

4. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   MONGO_URI=mongodb://fizahnad54:fizahnad54@ac-4aswuj7-shard-00-00.evtagpv.mongodb.net:27017,ac-4aswuj7-shard-00-01.evtagpv.mongodb.net:27017,ac-4aswuj7-shard-00-02.evtagpv.mongodb.net:27017/?replicaSet=atlas-tpg9zx-shard-0&ssl=true&authSource=admin
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=cea_rainfall_tracker_super_secret_key_2024
   ADMIN_API_KEY=cea_admin_super_secure_key_2024
   ```

   Create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_NAME=CEA Rainfall Tracker
   ```

5. **Load sample data**
   ```bash
   cd server
   yarn run load-data
   # or npm run load-data
   ```

6. **Start the application**
   
   Start backend (in server directory):
   ```bash
   yarn dev
   # or npm run dev
   ```
   
   Start frontend (in client directory):
   ```bash
   yarn start
   # or npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000

## 📚 API Documentation

### Authentication
All API requests require an `x-api-key` header with your API key.

### Public Endpoints (Requires API Key)

#### Get All Rainfall Data
```http
GET /api/rainfall/all
```

#### Get Rainfall by Date
```http
GET /api/rainfall/day/:date
```

#### Get Rainfall by Location
```http
GET /api/rainfall/location/:area
```

#### Get Specific Record
```http
GET /api/rainfall/:area/:date
```

#### Get Available Areas
```http
GET /api/areas
```

#### Get Statistics
```http
GET /api/stats
```

### Admin Endpoints (Requires Admin API Key)

#### Add Rainfall Record
```http
POST /admin/rainfall
Content-Type: application/json

{
  "area": "Erean",
  "date": "2023-10-03",
  "am1": 2.5,
  "am2": 3.1,
  "pm1": 1.8,
  "pm2": 2.2
}
```

#### Update Rainfall Record
```http
PUT /admin/rainfall/:id
```

#### Delete Rainfall Record
```http
DELETE /admin/rainfall/:id
```

#### Create New User
```http
POST /admin/users
Content-Type: application/json

{
  "email": "user@example.com",
  "isAdmin": false
}
```

## 🏗️ Project Structure

```
cea-rainfall-tracker/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html               # Main HTML file
│   │   └── manifest.json            # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.jsx       # Admin interface
│   │   │   ├── ApiDocs.jsx          # API documentation
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── Header.jsx           # Navigation header
│   │   │   ├── HomePage.jsx         # Landing page
│   │   │   ├── LoginForm.jsx        # User authentication
│   │   │   ├── RainfallModal.jsx    # Rainfall data modal
│   │   │   ├── RainfallTable.jsx    # Data table component
│   │   │   └── RegisterForm.jsx     # User registration
│   │   ├── App.jsx                  # Main app component
│   │   ├── App.css                  # App styles
│   │   ├── api.js                   # API configuration
│   │   ├── index.css                # Global styles
│   │   └── index.js                 # Entry point
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # TailwindCSS configuration
│   └── yarn.lock                    # Yarn lock file
├── server/                          # Node.js backend
│   ├── models/
│   │   ├── Rainfall.js              # Rainfall data model
│   │   ├── Request.js               # Request logging model
│   │   └── User.js                  # User model
│   ├── routes/
│   │   ├── adminRoutes.js           # Admin API routes
│   │   └── apiRoutes.js             # Public API routes
│   ├── middleware/
│   │   ├── errorHandler.js          # Error handling middleware
│   │   ├── sanitizeInput.js         # Input validation middleware
│   │   └── verifyApiKey.js          # Authentication middleware
│   ├── utils/
│   │   ├── cookieUtils.js           # Cookie management
│   │   ├── generateApiKey.js        # API key generation
│   │   └── logger.js                # Logging utilities
│   ├── scripts/
│   │   └── loadSampleData.js        # Sample data loader
│   ├── sampleData/
│   │   └── rainfall.csv             # Sample rainfall data
│   ├── index.js                     # Main server file
│   ├── db.js                        # Database connection
│   ├── package.json                 # Backend dependencies
│   └── yarn.lock                    # Yarn lock file
├── CEA_Rainfall_Tracker_Assignment.md  # Assignment documentation
└── README.md                        # Project documentation
```

## 🔒 Security Features

### Authentication & Authorization
- **API Key Authentication**: Secure token-based access
- **Role-Based Access**: Admin and standard user permissions
- **Session Management**: Secure session handling

### Data Protection
- **Input Sanitization**: Prevents XSS and injection attacks
- **Data Validation**: Comprehensive input validation
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Secure cross-origin requests

### Infrastructure Security
- **Helmet.js**: HTTP security headers
- **Environment Variables**: Secure configuration management
- **Error Handling**: Secure error responses
- **Logging**: Comprehensive security event logging

## 🧪 Testing

### Manual Testing Checklist

#### Authentication Testing
- [ ] Test invalid API keys return 403
- [ ] Test missing API key returns 401
- [ ] Test admin-only endpoints with non-admin key
- [ ] Test user registration and API key generation

#### Security Testing
- [ ] Test XSS prevention with script tags
- [ ] Test SQL injection prevention
- [ ] Test input sanitization
- [ ] Test rate limiting functionality

#### API Testing
- [ ] Test all GET endpoints
- [ ] Test POST/PUT/DELETE with admin key
- [ ] Test data validation
- [ ] Test error handling

#### Frontend Testing
- [ ] Test responsive design
- [ ] Test form validation
- [ ] Test data filtering and search
- [ ] Test CSV export functionality

### Testing Tools
- **Postman/Insomnia**: API testing
- **Browser DevTools**: Frontend testing
- **MongoDB Compass**: Database inspection

## 📊 Data Model

### Rainfall Schema
```javascript
{
  area: String,        // Monitoring area name
  date: Date,          // Date of measurement
  am1: Number,         // Morning reading 1
  am2: Number,         // Morning reading 2
  pm1: Number,         // Afternoon reading 1
  pm2: Number,         // Afternoon reading 2
  createdAt: Date,     // Record creation timestamp
  updatedAt: Date      // Last update timestamp
}
```

### User Schema
```javascript
{
  email: String,       // User email address
  apiKey: String,      // Unique API key
  isAdmin: Boolean,    // Admin privileges
  createdAt: Date,     // Account creation date
  lastUsed: Date       // Last API usage
}
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Deploy to Heroku/Vercel/AWS
4. Set up logging and monitoring

### Frontend Deployment
1. Build the React application
2. Deploy to Netlify/Vercel/AWS S3
3. Configure environment variables
4. Set up custom domain

## 📈 Performance Optimization

### Backend
- **Database Indexing**: Optimized queries
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip compression
- **Connection Pooling**: Efficient database connections

### Frontend
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed images
- **Bundle Optimization**: Minimized bundle size
- **CDN**: Content delivery network

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGO_URI=mongodb://...
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
ADMIN_API_KEY=your_admin_key
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_NAME=CEA Rainfall Tracker
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 📚 Assignment Documentation

This project includes comprehensive assignment documentation covering:

### Full-Stack Development Analysis
- **Technology Stack Comparison**: LAMP, MEAN/MERN, Ruby on Rails, Java Spring Boot, Python Django/Flask
- **MERN Stack Justification**: Detailed analysis of why MERN is optimal for government projects
- **Cloud-based SOA Benefits**: Service-Oriented Architecture advantages over monolithic solutions

### Implementation Details
- **API Design**: Complete endpoint specification with request/response examples
- **Database Schema**: MongoDB design with validation and indexing
- **Authentication System**: JWT-based security with role-based access control
- **Frontend Architecture**: React.js component structure and state management

### Security Hardening
- **Threat Analysis**: OWASP Top 10 vulnerabilities and mitigation strategies
- **Protective Measures**: Input validation, rate limiting, security headers
- **Testing Procedures**: Penetration testing and vulnerability assessment
- **Industry Standards**: Compliance with government security requirements

### Solution Evaluation
- **Requirements Compliance**: Detailed mapping of client requirements to implementation
- **Best Practices Alignment**: Industry standard adherence and deviations
- **Performance Metrics**: Scalability and performance benchmarks
- **Enhancement Opportunities**: Future improvement recommendations

**View the complete assignment document:**
```bash
# Open in VS Code with markdown preview
code CEA_Rainfall_Tracker_Assignment.md

# Or open with any text editor
notepad CEA_Rainfall_Tracker_Assignment.md
```

**Built with ❤️ for the Government Environmental Agency** 
