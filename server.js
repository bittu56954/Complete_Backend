import express, { json } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// --- Import User Controllers ---
import { Register, Login, getUser, Delete, UpdateUser } from './Controller/User.js';
// --- Import Book Controllers ---
import { createBook, getAllBooks, getBookById, updateBook, deleteBook } from './Controller/Book.js';

// --- Import Middlewares ---
// Note: Make sure to export 'isAdmin' from your Middle.js file as well!
import { authenticateToken, isAdmin } from './MiddleWear/Middle.js'; 

const app = express();
const port = process.env.PORT || 3000; // Fallback to 3000 if PORT isn't set in .env
const dburl = process.env.MONGOURL;

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Global Middleware ---
app.use(json());
// Serve the uploads folder so images are accessible via URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer Configuration (Internal) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure 'uploads' folder exists
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// --- Database Connection ---
const connection = async () => {
  try {
    await mongoose.connect(dburl);
    console.log("Database connection successfully");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};
connection();


// --- USER ROUTES ---
// Admin or authenticated check to get all users
app.get('/api/users', authenticateToken, getUser); 
app.post('/api/register', Register);
app.post('/api/login', Login);

// Fixed: Removed '/:id' because your updated controllers extract the ID securely from the JWT token
app.delete('/api/delete/user', authenticateToken, Delete); 
app.put('/api/update/user', authenticateToken, UpdateUser);


// --- BOOK ROUTES (CRUD) ---
// Chained 'authenticateToken' and 'isAdmin' together to protect modification endpoints

// 🔒 Admin Only Routes
app.post('/api/books/create', authenticateToken, isAdmin, upload.single('image'), createBook);
app.put('/api/books/update/:id', authenticateToken, isAdmin, upload.single('image'), updateBook);
app.delete('/api/books/delete/:id', authenticateToken, isAdmin, deleteBook);

// 🔓 Public Routes (Anyone logged in or out can view books)
app.get('/api/books', getAllBooks);
app.get('/api/books/:id', getBookById);


// --- Server Startup ---
app.listen(port, () => {
  console.log(`Your server is running on http://localhost:${port}`);
});