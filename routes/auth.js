const express = require('express')
const router = express.Router();

//Import controller
const {signup,activateAccount,forgotPassword,resetPassword,signin,googlelogin} = require('../controllers/auth')

router.post('/signup',signup)
router.post('/email-activate',activateAccount)
router.post('/signin',signin)

router.put('/forgot-password',forgotPassword);
router.put('/reset-password',resetPassword);


router.post('/googlelogin',googlelogin);

module.exports = router;