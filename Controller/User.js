import User from "../Models/User.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

// 1. GET ALL USERS (Kept standard, but wrapped in try/catch)
export const getUser = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json({
      status: "success",
      message: "All users of your website",
      User: user,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

// 2. REGISTER USER
export const Register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: role
    });

    return res.json({
      status: "success",
      message: "User created successfully",
      User: newUser,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 3. LOGIN USER
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Storing the user object inside payload as requested
        const payload = {
          user: user
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({
          message: "User Login successfully",
          Token: token
        });
      } else {
        return res.status(401).send("User Password is wrong");
      }
    } else {
      return res.status(401).send("User email is wrong");
    }
  } catch (error) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

// 4. DELETE USER (Uses token instead of URL params for self-deletion)
export const Delete = async (req, res) => {
  try {
    // Extracting user ID securely from the token payload
    const userId = req.user.user._id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (deletedUser) {
      return res.status(200).send("Your account has been deleted successfully");
    }

    return res.status(404).send("User not found");
  } catch (error) {
    res.status(500).send("Error deleting user");
  }
};

// 5. UPDATE USER (Uses token instead of URL params for security)
export const UpdateUser = async (req, res) => {
  try {
    const userId = req.user.user._id; // Extracted securely from token
    const updates = req.body;

    // Securely update by ID found inside token payload
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({ 
      message: "Update failed", 
      error: error.message 
    });
  }
};

// 6. BOOK ISSUE (Now reads user id dynamically from the token)
export const BookIssue = async (req, res) => {
  try {
    const userid = req.user.user._id; // Secure extraction
    const { bookid } = req.params;   // Only bookid comes from the URL now

    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    const updatedUser = await User.findByIdAndUpdate(
      userid,
      {
        $push: { 
          issuedBooks: { bookId: bookid, returnBy: returnDate } 
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Book issued successfully",
      issuedBooks: updatedUser.issuedBooks
    });
  } catch (error) {
    res.status(400).json({ message: "Issue failed", error: error.message });
  }
};

// 7. RETURN BOOK (Now reads user id dynamically from the token)
export const ReturnBook = async (req, res) => {
  try {
    const userid = req.user.user._id; // Secure extraction
    const { bookid } = req.params;   // Only bookid comes from the URL now

    const updatedUser = await User.findByIdAndUpdate(
      userid,
      {
        $pull: { issuedBooks: { bookId: bookid } }
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Book returned successfully",
      data: updatedUser.issuedBooks
    });
  } catch (error) {
    res.status(400).json({ message: "Return failed", error: error.message });
  }
};

// 8. SHOW USER ISSUED BOOKS (Now reads user id dynamically from the token)
export const GetIssuedBooks = async (req, res) => {
  try {
    const userid = req.user.user._id; // Secure extraction

    const user = await User.findById(userid).populate('issuedBooks.bookId');

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      status: "success",
      count: user.issuedBooks.length,
      issuedBooks: user.issuedBooks
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};