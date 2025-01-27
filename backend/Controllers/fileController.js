const File = require("../Models/fileModel");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

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



// Function to replace placeholders in the email body
function changeName(sender, receiver, bodyTemplate) {
  let newBody = bodyTemplate.replace("<Reciever>", receiver);
  newBody = newBody.replace("<Sender>", sender);
  return newBody;
}

// Function to print the lists
const printList = (id, status) => {
  console.log(id.length);
  for (let i = 0; i < id.length; i++) {
    console.log(`ID: ${id[i]} => Status: ${status[i]}`);
  }
};

// Function to send emails from CSV
const sendEmailsFromCSV = (SenderName, Subject, EmailPrompt, filePath) => {
  return new Promise((resolve, reject) => {
    const promises = [];
    const bodyTemplate = EmailPrompt;
    const sender = SenderName;
    const subject = Subject;
    const Path = filePath;

    let id = [];
    let status = [];

    // Read the sendinglist.csv
    fs.createReadStream(Path)
      .pipe(csv())
      .on("data", (row) => {
        const receiver = row["Receiver"]; // Adjust column name as per CSV
        const emailID = row["ID"]; // Adjust column name as per CSV

        const newBody = changeName(sender, receiver, bodyTemplate);

        // Set up Mailgun client
        const mg = mailgun.client({
          username: "api",
          key: "113d7718f0d8988902d1217125ff9c18-f6fe91d3-3e81daba",
          url: "https://api.mailgun.net",
        });

        const emailPromise = mg.messages
          .create("sandbox644423b2e55a429b832b5113527a7259.mailgun.org", {
            from: "EmailSender <emailsender4030@gmail.com>",
            to: emailID,
            subject: subject,
            text: newBody,
          })
          .then(() => {
            id.push(emailID); // Add emailID to id array
            status.push("Success"); // Add "Success" to status array
          })
          .catch((err) => {
            id.push(emailID); // Add emailID to id array
            status.push("Failed"); // Add "Failed" to status array
            console.error(`Error sending email to ${emailID}:`, err);
          });

        promises.push(emailPromise);
      })
      .on("end", () => {
        // Wait for all promises to complete
        Promise.all(promises)
          .then(() => {
            console.log("Emails sent.");
            printList(id, status); // Print the list
            resolve({ ids: id, statuses: status }); // Resolve with results
          })
          .catch((err) => {
            console.error("Error processing some emails:", err);
            reject(err);
          });
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        reject(err);
      });
  });
};

// Upload File
const uploadFile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;

    File.uploadedFile(req, res, async function (err) {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload failed", error: err.message });
      }

      if (req.file && req.file.mimetype === "text/csv") {
        try {
          const { SenderName, Subject, EmailPrompt } = req.body;

          if (!SenderName || !Subject || !EmailPrompt) {
            return res.status(400).json({ message: "All fields are required" });
          }

          const relativeFilePath = path.relative(
            path.resolve(__dirname, "../"), // Adjust to your project root
            req.file.path
          );

          const savedFile = await File.create({
            SenderName: SenderName.trim(),
            Subject: Subject.trim(),
            EmailPrompt: EmailPrompt.trim(),
            filePath: relativeFilePath,
            originalName: req.file.originalname,
            file: req.file.filename,
            userId: userId,
            userEmail: userEmail,
          });

          console.log("File Saved in Database:", savedFile);

          // Wait for emails to be sent and get the results
          const { ids, statuses } = await sendEmailsFromCSV(
            savedFile.SenderName,
            savedFile.Subject,
            savedFile.EmailPrompt,
            savedFile.filePath
          );

          return res.status(200).json({
            message: "Mails sent successfully",
            file: savedFile,
            results: { ids, statuses },
          });
        } catch (err) {
          console.error("Database Error:", err);
          return res.status(500).json({
            message: "Error saving file to database",
            error: err.message,
          });
        }
      } else {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting invalid file:", unlinkErr);
        });
        return res.status(400).json({ message: "Please upload a valid CSV file" });
      }
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
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