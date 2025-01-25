const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter.js');
require('dotenv').config();
const flash = require('connect-flash');
const session = require('express-session');
const fileRouter = require('./Routes/fileRouters');

const PORT = process.env.PORT || 8000;
const db = require('./Models/db.js');

// Routes
app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.use(express.json()); // Only use express.json(), no need for bodyParser.json()

// CORS Middleware Setup (restricting to your frontend)
app.use(cors({
  origin: 'http://localhost:3000', // Allow only this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Static Folder for Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session and Flash for authentication
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// Routes
app.use('/auth', AuthRouter);
app.use('/', fileRouter);  // Enable file routes

// Catch-All Route for Unhandled Requests
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
