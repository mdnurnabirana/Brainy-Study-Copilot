# 🧠 Brainy Study Copilot

**Your Learning Copilot — AI-powered study companion for smarter learning**

**Live Demo:** [https://brainystudycopilot.netlify.app](https://brainystudycopilot.netlify.app)

---

## 🚀 Overview

**Brainy Study Copilot** is a full-stack AI-powered learning platform designed to help students study smarter, not harder. It combines document management, AI-powered question answering, automatic flashcard generation, quizzes, and learning progress tracking into a single, intuitive app.

Students can upload PDFs, ask questions from their documents, chat with an AI tutor, generate flashcards from study materials, take quizzes, and track learning progress over time.

This project demonstrates:

* Real-world full-stack architecture
* Secure authentication & protected APIs
* File upload + PDF parsing + text chunking
* AI integration (Gemini or external AI APIs)
* Clean frontend service abstraction
* Scalable backend structure

---

## ✨ Core Features (Detailed)

### 🔐 Authentication & User Accounts

* User registration & login with JWT authentication
* Password hashing and secure auth flow
* Protected routes (only authenticated users can access study features)
* Per-user data isolation (documents, flashcards, quizzes, progress)

---

### 📄 Document Upload & Processing

* Upload PDF documents using `multer`
* Server-side PDF parsing
* Automatic text chunking for:

  * AI context
  * Flashcard generation
  * Quiz creation
* Document storage linked to users
* Metadata tracking (filename, upload date, processed status)

---

### 🤖 AI Chat & Document Q&A

* General AI chat for learning help
* Document-based Q&A:

  * Ask questions from uploaded PDFs
  * Relevant chunks are extracted and sent to AI
  * AI answers with document-aware context
* Chat history stored per user
* External AI service integration via `utils/geminiService.js`

---

### 🧠 Flashcards

* Automatic flashcard generation from documents
* Manual flashcard creation
* Flashcard sets per document or topic
* CRUD operations:

  * Create, update, delete flashcards
* Designed for spaced repetition style learning

---

### 📝 Quizzes & Evaluation

* Auto-generate quizzes from documents
* Take quizzes in the UI
* Score calculation and result tracking
* Per-user quiz history
* Useful for exam preparation & self-testing

---

### 📊 Learning Progress Tracking

* Tracks:

  * Documents studied
  * Flashcards reviewed
  * Quizzes taken
  * Quiz performance
* Progress data shown in dashboard
* Can be extended for streaks, goals, and achievements

---

### 📁 File Handling

* File uploads handled with `multer`
* Server-side validation
* PDF parsing with custom utility
* Chunking for AI context windows

---

## 🧱 System Architecture

### 🏗️ High-Level Architecture

```
[ React + Vite Frontend ]
          |
          |  REST API (Axios)
          |
[ Node.js + Express Backend ]
          |
          |  Mongoose ODM
          |
       [ MongoDB ]
          |
          |
     [ AI API (Gemini) ]
```

---

## 🧩 Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* Multer (file uploads)
* Axios (external API calls)

### Frontend

* React
* Vite
* Context API (state management)
* Axios (API calls)
* Component-based UI

### AI & Utilities

* Gemini / external AI API
* PDF parsing utility
* Text chunking utility

---

## 📁 Project Structure

### Root

```
brainy-study-copilot/
├── backend/
└── frontend/
```

---

### Backend Structure

```
backend/
├── controllers/
│   ├── aiController.js
│   ├── authController.js
│   ├── documentController.js
│   ├── flashCardController.js
│   ├── progressController.js
│   └── quizController.js
│
├── models/
│   ├── User.js
│   ├── Document.js
│   ├── FlashCard.js
│   ├── Quiz.js
│   └── ChatHistory.js
│
├── routes/
│   ├── authRoutes.js
│   ├── aiRoutes.js
│   ├── documentRoutes.js
│   ├── flashCardRoutes.js
│   ├── progressRoutes.js
│   └── quizRoutes.js
│
├── utils/
│   ├── geminiService.js
│   ├── pdfParser.js
│   └── textChunker.js
│
├── config/
│   └── db.js
│
├── middleware/
│   └── authMiddleware.js
│
├── uploads/
├── server.js
└── .env
```

---

### Frontend Structure

```
frontend/
└── src/
    ├── components/
    │   ├── Chat/
    │   ├── Flashcards/
    │   ├── Documents/
    │   └── Quizzes/
    │
    ├── pages/
    │   ├── Auth.jsx
    │   ├── Dashboard.jsx
    │   ├── Documents.jsx
    │   ├── Flashcards.jsx
    │   ├── Quizzes.jsx
    │   └── Profile.jsx
    │
    ├── services/
    │   ├── axiosInstance.js
    │   ├── authService.js
    │   ├── aiService.js
    │   ├── documentService.js
    │   ├── flashcardService.js
    │   ├── progressService.js
    │   └── quizService.js
    │
    ├── context/
    ├── App.jsx
    └── main.jsx
```

---

## 🔌 API Overview

| Route Group       | Description                |
| ----------------- | -------------------------- |
| `/api/auth`       | Register, login, JWT auth  |
| `/api/documents`  | Upload PDFs, list, parse   |
| `/api/ai`         | Chat, document Q&A         |
| `/api/flashcards` | Flashcard CRUD             |
| `/api/quizzes`    | Quiz creation & results    |
| `/api/progress`   | Learning progress tracking |

---

## ⚙️ Environment Variables

Create `.env` inside `backend/`:

```env
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_api_key
```

Frontend (example):

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🛠️ Setup & Running Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🧪 Sample Credentials

You can register a new account, or use seeded users if available:

```
Email: userone@gmail.com
Password: 1234Aa!
```

---

## 📦 Production Build

```bash
cd frontend
npm run build
```

Deploy `/dist` to Netlify or Vercel.

---

## 🧠 Future Improvements

* Role-based access (student / teacher)
* AI-powered summaries
* Spaced repetition scheduling
* Learning streaks & gamification
* Real-time collaboration
* Search inside documents
* OCR for scanned PDFs
* Cloud storage for files

---