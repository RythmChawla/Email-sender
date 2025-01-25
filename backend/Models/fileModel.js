/****************IMPORTING MONGOOSE*******************************/
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

/****************DEFINING CONSTANTS*******************************/
const FILES_PATH = path.join(__dirname, "../uploads/files");

/***************CREATING FILE SCHEMA*****************************/
const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  SenderName: { type: String },
  Subject: { type: String },
  EmailPrompt: { type: String },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, // Link to User
  userEmail: { type: String, required: true }
});

/*******SETTINGS FOR UPLOADING FILE USING MULTER****************/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILES_PATH); // Save files in the `uploads/files` directory
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname); // Get file extension
    const baseName = path.basename(file.originalname, extension); // Get base file name
    cb(null, `${baseName}-${Date.now()}${extension}`); // Add timestamp to file name
  },
});

// File filter to allow only CSV files
const fileFilter = function (req, file, cb) {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only CSV files are allowed."), false);
  }
};

// Static functions for file upload
fileSchema.statics.uploadedFile = multer({
  storage: storage,
  fileFilter: fileFilter, // Validate CSV file type
}).single("file"); // Use "file" as the form key

fileSchema.statics.filePath = FILES_PATH;

/******************CREATING MODEL********************************/
const Files = mongoose.model("Files", fileSchema);

/*****************EXPORTING MODEL*******************************/
module.exports = Files;
