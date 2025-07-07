const express=require('express')
const authController=require('../controllers/authController.js')
const { identifier } = require('../middlewares/identification.js')
const router=express.Router()

router.post('/signup',authController.signup)
router.post('/signin',authController.signin) 
router.post('/signout',identifier,authController.signout)

router.patch('/send-verificatiob-code',identifier,authController.sendVerificationCode)
router.patch('/verify-Verification-Code',identifier,authController.verifyVerificationCode)
router.patch('/change-password',identifier,authController.changePassword)
router.patch('/send-forget-password-code',authController.sendForgotPasswordCode)
router.patch('/verify-forgot-password-code',authController.verifyForgetPasswordCode)
module.exports=router