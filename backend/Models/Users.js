const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  files: [
    {
      fileName: String,
      filePath: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
