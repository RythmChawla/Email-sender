const File = require("../Models/fileModel");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const FILES_PATH = path.join(__dirname, "../uploads/files");

// Home Route
const home = async (req, res) => {
  try {
    const files = await File.find({});
    res.status(200).json({ files, layout: false });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Upload File
const uploadFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    File.uploadedFile(req, res, async function (err) {
      if (err) {
        // console.error("Multer Error:", err);
        return res
          .status(400)
          .json({ message: "File upload failed", error: err.message });
      }

      console.log("Uploaded File Details:", req.file);

      if (req.file && req.file.mimetype === "text/csv") {
        try {
          const { SenderName, Subject, EmailPrompt } = req.body;

          // Validate fields
          if (!SenderName || !Subject || !EmailPrompt) {
            return res.status(400).json({ message: "All fields are required" });
          }

          const savedFile = await File.create({
            SenderName: SenderName.trim(),
            Subject: Subject.trim(),
            EmailPrompt: EmailPrompt.trim(),
            filePath: req.file.path,
            originalName: req.file.originalname,
            file: req.file.filename,
            userId: userId,
            userEmail: userEmail
          });

          console.log("File Saved in Database:", savedFile);
          return res
            .status(200)
            .json({ message: "File uploaded successfully", file: savedFile });
        } catch (err) {
          console.error("Database Error:", err);
          return res
            .status(500)
            .json({
              message: "Error saving file to database",
              error: err.message,
            });
        }
      } else {
        console.warn("Invalid file format. Only CSV files are allowed.");
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr)
            console.error("Error deleting invalid file:", unlinkErr);
        });
        return res
          .status(400)
          .json({ message: "Please upload a valid CSV file" });
      }
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// Delete File
const fileDelete = async (req, res) => {
  try {
    const filename = path.basename(req.params.file);
    console.log("Filename to delete:", filename);

    // const fileRecord = await File.findOne({ file: filename });
    const fileRecord = await File.findOne({ filePath: { $regex: filename, $options: "i" } });
    if (!fileRecord) {
      console.warn("File not found in database for deletion.");
      return res.status(404).json({ message: "File not found" });
    }

    console.log("File record found:", fileRecord);

    await File.deleteOne({ _id: fileRecord._id });

    const filePath = path.join(FILES_PATH, filename);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err.message);
        }
      });
    } else {
      console.warn("File does not exist on disk.");
    }

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error during file deletion:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Show File
const showFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { file_id, page = 1, limit = 100 } = req.query; // Default: page 1, 100 rows per page

    // If no file_id is provided, return all files
    if (!file_id) {
      const userFiles = await File.find({ userId: userId });
      // const allFiles = await File.find({});
      return res.status(200).json({ files: userFiles });
    }

    // Check if file_id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(file_id)) {
      return res.status(400).json({ message: "Invalid file_id format" });
    }

    const fileRecord = await File.findOne({ _id: file_id, userId: userId });

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
        const totalRows = results.length; // Total rows in the CSV
        const totalPages = Math.ceil(totalRows / limit); // Total pages
        const startIndex = (page - 1) * limit; // Start index for current page
        const paginatedData = results.slice(
          startIndex,
          startIndex + parseInt(limit)
        ); // Paginate rows

        return res.status(200).json({
          title: fileRecord.originalName,
          SenderName: fileRecord.SenderName,
          Subject: fileRecord.Subject,
          EmailPrompt: fileRecord.EmailPrompt,
          head: headers,
          data: paginatedData,
          page: parseInt(page),
          totalPages,
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
