import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  // Link to the Admin who created it
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Must match the name in mongoose.model('User', userSchema)
    required: [true, 'Admin reference is required']
  },
  name: {
    type: String,
    required: [true, 'Book name is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    lowercase: true // Keeps categories like "Fiction" and "fiction" consistent
  },
  image:{
    type:String,
    default:'No image links'
  }
}, {
  timestamps: true 
});

const Book = mongoose.model('Book', BookSchema);
export default Book;