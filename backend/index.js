const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter.js')
require('dotenv').config();
const flash = require('connect-flash');
const session = require('express-session');
const fileRouter = require('./Routes/fileRouters');

const PORT = process.env.PORT || 8000;
const db = require('./Models/db.js');

app.get('/ping', (req,res)=>{
    res.send('PONG');
})
app.use(express.json());
app.use(express.urlencoded());

app.use(express.static('./backend'));

app.use(bodyParser.json());
app.use(cors());
app.use('/auth',AuthRouter)

app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// Static Folder for Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/', fileRouter);

// Catch-All Route for Unhandled Requests
app.use((req, res, next) => {
  res.status(404).send('404 Not Found');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.listen(PORT, ()=>{
    console.log(`server is running on port: ${PORT}.`);
})

