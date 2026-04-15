# MoneyLens - AI-Powered Personal Finance Tracker

MoneyLens is a modern, full-stack web application designed to help users manage their personal finances. 

## 🚀 Features

- **AI Receipt Scanning**: Upload images of your receipts, and MoneyLens will automatically extract the title, amount, date, and category using Mistral AI's Pixtral model.
- **Financial Insights**: Receive automated insights and suggestions based on your spending patterns.
- **Transaction Management**: Create, edit, and categorize your transactions. supports bulk operations and recurring transactions.
- **Analytics Dashboard**: Visualize your spending habits with interactive charts and reports.
- **Secure Authentication**: Robust user authentication system with JWT and Passport.js.

## 🛠️ Tech Stack

### Backend
- **Core**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Mistral AI (Pixtral-12B for vision, Mistral-Small for insights)
- **File Storage**: Cloudinary (via Multer)
- **Authentication**: JWT, Passport.js, bcrypt
- **Validation**: Zod
- **Mailing**: Resend
- **Scheduling**: Node-cron

### Frontend
- **Framework**: React (Vite)
- **State Management**: Redux Toolkit, Redux Persist
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide React, Sonner
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Mistral AI API Key
- Cloudinary Credentials
- Resend API Key (for emails)

### 1. Clone the repository
```bash
git clone https://github.com/vishal0930/MoneyLens.git
cd MoneyLens
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
MISTRAL_API_KEY=your_mistral_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RESEND_API_KEY=your_resend_api_key
FRONTEND_ORIGIN=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Start the frontend development server:
```bash
npm run dev
```

## 📜 License
This project is licensed under the ISC License.
