# Digital E Gram Panchayat - Complete Full Stack Application

A comprehensive digital platform for rural governance that modernizes Gram Panchayat services through technology. This application enables citizens to access government services online, staff to manage applications efficiently, and administrators to oversee the entire system.

## 🌟 Features

### 🏛️ **Government Services Digitization**
- **25+ Real Government Services** including PM Awas Yojana, Caste Certificates, Water Connections, etc.
- **Department-based Service Management** (Housing, Agriculture, Water & Sanitation, etc.)
- **Document Upload & Verification System**
- **Application Tracking** with unique tracking IDs
- **Digital Certificate Generation**

### 👥 **Role-Based Access Control**
- **Citizens (Users)**: Apply for services, track applications, upload documents
- **Staff**: Department-specific application processing, document verification
- **Admin**: Complete system management, analytics, user promotion

### 🌍 **Multilingual Support (i18n)**
- **7 Indian Languages**: English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati
- **Dynamic Language Switching** with persistent preferences
- **Native Script Display**

### 🔐 **Security & Authentication**
- **JWT-based Authentication** with HTTP-only cookies
- **Role & Sub-role Authorization**
- **Department-based Access Control**
- **Secure File Upload** with Cloudinary integration

### 📊 **Analytics & Reporting**
- **Real-time Dashboard Analytics**
- **Department-wise Application Statistics**
- **Monthly Trends & Charts** (using Recharts)
- **Service Usage Analytics**
- **System Activity Logs**

### 🔔 **Notification System**
- **Real-time In-App Notifications** for application updates, announcements, and system events
- **No email notifications are sent; all alerts are delivered instantly within the platform**
- **System Announcements**

### 📱 **Modern UI/UX**
- **Responsive Design** (Mobile-first approach)
- **Beautiful Animations** (Framer Motion)
- **Intuitive Navigation**
- **Accessibility Compliant**
- **Progressive Web App** features

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **React Hook Form** for form management
- **React i18next** for internationalization
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons

### **Backend**
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Cloudinary** for file storage
- **Winston** for logging
- **Express Validator** for input validation

### **DevOps & Tools**
- **Vite** for frontend build
- **ESLint** for code linting
- **Prettier** for code formatting
- **Git** for version control

## 📁 Project Structure

```
digital-gram-panchayat/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── i18n/           # Internationalization files
│   │   ├── layouts/        # Layout components
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── utils/             # Utility functions
│   ├── locales/           # Backend translations
│   ├── config/            # Configuration files
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for file uploads)

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd digital-gram-panchayat
```

### **2. Backend Setup**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
npm run dev
```

### **3. Frontend Setup**
```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```

### **4. Environment Configuration**

#### **Backend (.env)**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/digital-gram-panchayat

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 📋 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/me           # Get current user
PUT  /api/auth/me/language  # Update language preference
```

### **User Endpoints**
```
GET  /api/user/services           # Get all services
GET  /api/user/services/:id       # Get service details
POST /api/user/applications       # Submit application
GET  /api/user/applications       # Get user applications
GET  /api/user/applications/:id   # Get application details
POST /api/user/upload-documents   # Upload documents
GET  /api/user/notifications      # Get notifications
```

### **Staff Endpoints**
```
GET  /api/staff/applications            # Get department applications
PUT  /api/staff/applications/:id/status # Update application status
PUT  /api/staff/applications/:id/verify # Verify documents
POST /api/staff/applications/:id/comment # Add internal comment
```

### **Admin Endpoints**
```
GET  /api/admin/users             # Get all users
PUT  /api/admin/users/:id/promote # Promote user
POST /api/admin/services          # Create service
PUT  /api/admin/services/:id      # Update service
DELETE /api/admin/services/:id    # Delete service
GET  /api/admin/analytics         # Get system analytics
GET  /api/admin/logs              # Get system logs
POST /api/admin/notifications     # Send notifications
```

## 🎯 Key Features Implementation

### **1. Department-Based Staff Management**
Staff members are assigned to specific departments and can only access applications for services in their department:

```javascript
// Example: Housing & Welfare staff can only see:
- PM Awas Yojana applications
- Old Age Pension applications
```

### **2. Real Government Services**
The application includes actual Indian government schemes:

- **Housing**: PM Awas Yojana, Old Age Pension
- **Agriculture**: PM Kisan Samman Nidhi, Seed Subsidies
- **Water & Sanitation**: Swachh Bharat Toilet Subsidy, Water Connections
- **Certificates**: Caste, Income, Birth, Death, Marriage certificates
- **Infrastructure**: Road repairs, School construction requests

### **3. Advanced Application Tracking**
Each application gets a unique tracking ID based on service category:
- Housing: HW2024001
- Agriculture: AG2024002
- Water: WS2024003

## 🔧 Development Guidelines

### **Code Standards**
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for functions

### **Security Best Practices**
- Input validation on all endpoints
- Rate limiting on API routes
- Secure file upload validation
- XSS protection with helmet

### **Performance Optimization**
- Database indexing for queries
- Image optimization with Cloudinary
- Lazy loading for components
- Efficient state management
- Caching strategies

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
npm test
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

## 🚀 Deployment

### **Backend Deployment (Railway/Render)**
1. Create account on Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically on push

### **Frontend Deployment (Vercel/Netlify)**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

### **Database (MongoDB Atlas)**
1. Create MongoDB Atlas cluster
2. Get connection string
3. Update MONGODB_URI in environment

## 📞 Support & Contributing

### **Getting Help**
- Check the documentation
- Review existing issues
- Create detailed bug reports
- Join community discussions

### **Contributing**
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Follow code review process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Government of India** for digital governance initiatives
- **React Team** for the amazing framework
- **MongoDB** for the flexible database
- **Cloudinary** for file management
- **All Contributors** who helped build this platform

---

**Digital E Gram Panchayat** - Empowering rural communities through digital governance 🇮🇳

For more information, visit our [documentation](docs/) or contact the development team.