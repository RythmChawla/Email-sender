/****************IMPORTING PACKAGE/MODELS*************************/
const File = require("../Models/fileModel"); // Fixed relative path
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const FILES_PATH = path.join(__dirname, "../uploads/files");
const flash = require("connect-flash");
const session = require("express-session");

// redirect to HOME page
const home = async (req, res) => {
  try {
    let files = await File.find({});
    res.status(200).json({
      files: files,
      layout: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const uploadFile = async (req, res) => {
  try {
    File.uploadedFile(req, res, async function (err) {
      if (err) {
        console.error("Multer Error:", err); // Log Multer-specific error
        return res.status(400).json({ message: "File upload failed", error: err.message });
      }

      console.log("Uploaded File Details:", req.file); // Log uploaded file details

      // Check for valid CSV file
      if (req.file && req.file.mimetype === "text/csv") {
        try {
          const savedFile = await File.create({
            filePath: req.file.path,
            originalName: req.file.originalname,
            file: req.file.filename,
          });
          console.log("File Saved in Database:", savedFile); // Log saved record
          return res.status(200).json({
            message: "File uploaded successfully",
            file: savedFile,
          });
        } catch (err) {
          console.error("Database Error:", err); // Log database error
          return res.status(500).json({ message: "Error saving file to database", error: err.message });
        }
      } else {
        console.log("Invalid file format. Only CSV files are allowed.");
        fs.unlinkSync(req.file.path); // Delete invalid file from the system
        return res.status(400).json({ message: "Please upload a valid CSV file" });
      }
    });
  } catch (err) {
    console.error("Server Error:", err); // Log general server error
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

const fileDelete = async (req, res) => {
  try {
    const filename = req.params.file;
    console.log("Filename to delete:", filename); // Debug log
    const fileRecord = await File.findOne({ file: filename });

    if (fileRecord) {
      console.log("File record found:", fileRecord); // Debug log
      await File.deleteOne({ file: filename });

      const filePath = path.join(FILES_PATH, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({ message: "File deleted successfully" });
    } else {
      console.error("File not found in database for deletion.");
      return res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Error during file deletion:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const showFile = async (req, res) => {
  try {
    const fileId = req.query.file_id;

    if (!fileId) {
      // If file_id is not provided, return all files or a suitable response
      const allFiles = await File.find();
      return res.status(200).json({
        message: "No file_id provided. Returning all files.",
        files: allFiles,
      });
    }

    const fileRecord = await File.findById(fileId);

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    const results = [];
    const headers = [];

    // Stream the file
    const fileStream = fs.createReadStream(fileRecord.filePath);
    fileStream
      .pipe(csv())
      .on("headers", (header) => {
        headers.push(...header);
      })
      .on("data", (data) => results.push(data))
      .on("end", () => {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 100;
        const totalPages = Math.ceil(results.length / pageSize);

        if (page > totalPages || page < 1) {
          return res.status(400).json({ message: "Invalid page number" });
        }

        const start = (page - 1) * pageSize;
        const slicedResults = results.slice(start, start + pageSize);

        return res.status(200).json({
          title: fileRecord.originalName,
          head: headers,
          data: slicedResults,
          length: results.length,
          page: page,
          totalPages: totalPages,
        });
      })
      .on("error", (error) => {
        console.error("Error reading file:", error);
        return res.status(500).json({ message: "Error reading file" });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



module.exports = {
  home,
  uploadFile,
  fileDelete,
  showFile,
};
