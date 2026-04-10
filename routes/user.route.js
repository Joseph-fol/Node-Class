const express = require('express')
const router = express.Router();
const { postSignUp, getSignUp, postSignin, getSignin, getDashboard } = require('../controller/user.controller')

router.get('/signup', getSignUp)
router.post('/register', postSignUp)
router.get('/signin', getSignin )
router.post('/login', postSignin)
router.get('/dashboard', getDashboard)

module.exports = router