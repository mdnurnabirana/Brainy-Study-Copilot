import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      minLength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, //It automatically adds and manages two fields in your documents:- createdAt: Date,updatedAt: Date
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  //use a normal function, not an arrow function
  if (!this.isModified("password")) {
    //When you update other fields (like email or name), you don’t want to re-hash
    return; //the already hashed password.
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); //await is necessary if you are using the async version of bcrypt.hash
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;