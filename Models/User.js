import mongoose from "mongoose";

const userSchema  = new mongoose.Schema({
  username:{
    type:String,
    unique:true,
    required:[true,'username must be required']
  },
  email:{
     type:String,
    unique:true,
    required:true
  },
 password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    }
    ,
    role: {
    type: String,
    // The enum ensures ONLY these two strings are allowed
    enum: ['user', 'admin'],
    default: 'user'
  },
issuedBooks: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book', // Links to your Book collection
      required: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    returnBy: Date
  }]

}
,{
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
})

const User = mongoose.model('User',userSchema);
export default User;







