const express = require("express");
const router = express.Router();
const { home, uploadFile, fileDelete, showFile } = require("../Controllers/fileController");

// HOME PAGE
router.get("/", home);

// UPLOAD A CSV FILE
router.post("/upload", uploadFile);

// DELETE A CSV FILE
router.get("/delete/:file", fileDelete);

// SHOW THE CSV FILE
router.get("/show", showFile);

module.exports = router;
