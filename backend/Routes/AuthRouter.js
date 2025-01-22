const { signup, login } = require('../Controllers/AuthController');
const {signupValidation, loginValidation}  = require('../Middlewares/AuthValidation');

const router = require('express').Router();

router.get('/ping', (req,res)=>{
    res.send('PONG');
})

router.post('/login',loginValidation, login)

router.post('/signup',signupValidation,signup)

module.exports = router;