const { signup, login,verifyToken } = require('../Controllers/AuthController');
const {signupValidation, loginValidation}  = require('../Middlewares/AuthValidation');
const {authMiddleware}  = require('../Middlewares/AuthMiddleware');

const router = require('express').Router();

router.get('/ping', (req,res)=>{
    res.send('PONG');
})

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/protected", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Protected route accessed!" });
});
module.exports = router;