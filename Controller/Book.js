import Book from "../models/Book.js";
import fs from "fs"; // Node.js File System to delete images if book is deleted

export const createBook = async (req, res) => {
  try {
    const { name, author, category, createdBy } = req.body;

    // Handle image path if file exists
    const imagePath = req.file ? `/uploads/${req.file.filename}` : 'No image links';

    const newBook = new Book({
      name,
      author,
      category,
      createdBy,
      image: imagePath
    });

    const savedBook = await newBook.save();
    res.status(201).json({ success: true, data: savedBook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllBooks = async (req, res) => {
  try {
    // .populate('createdBy', 'username email') fetches admin details instead of just ID
    const books = await Book.find().populate('createdBy');
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('createdBy');
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, message: "Invalid ID format" });
  }
};

export const updateBook = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If a new image is uploaded, update the path
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true, // returns the modified document
      runValidators: true // ensures schema rules are followed
    });

    if (!updatedBook) return res.status(404).json({ success: false, message: "Book not found" });

    res.status(200).json({ success: true, data: updatedBook });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    // Optional: Delete the image file from the server when book is deleted
    if (book.image && book.image !== 'No image links') {
        const fullPath = `.${book.image}`; // e.g., ./uploads/image.jpg
        fs.unlink(fullPath, (err) => {
            if (err) console.log("Failed to delete local image:", err);
        });
    }

    res.status(200).json({ success: true, message: "Book removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};