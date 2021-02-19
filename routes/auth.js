const express = require('express')
const router = express.Router();

//Import controller
const {signup,activateAccount} = require('../controllers/auth')

router.post('/signup',signup)
router.post('/email-activate',activateAccount)
module.exports = router;