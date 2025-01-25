const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../Middlewares/AuthMiddleware");
const { home, uploadFile, fileDelete, showFile } = require("../Controllers/fileController");

// HOME PAGE
router.get("/",authMiddleware, home);

// UPLOAD A CSV FILE
router.post("/upload",authMiddleware, uploadFile);

// DELETE A CSV FILE
router.get("/delete/:file",authMiddleware, fileDelete);

// SHOW THE CSV FILE
router.get("/show",authMiddleware, showFile);

module.exports = router;
