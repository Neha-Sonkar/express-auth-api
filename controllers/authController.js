const {signupSchema, changePasswordSchema}=require('../middlewares/validator')
const { signinSchema,acceptCodeSchema,acceptForgotPasswordCodeSchema }=require('../middlewares/validator')
const User=require('../models/userModel.js')
const {doHash, doHashValidation, hmacProcess}=require('../utils/hashing')
const jwt=require('jsonwebtoken')
const crypto=require('crypto')
const transport = require('../middlewares/sendMail.js')

exports.signup=async(req,res)=>{
    const {email,password}=req.body 
    try{ 
        const {error,value}=signupSchema.validate({email,password})
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.status(401).json({success:false,message:'User already exists!'})
        }

        const hashedPassword=await doHash(password,12)
        const newUser=new User({
            email,
            password:hashedPassword
        })
        const result=await newUser.save()
        result.password=undefined
        res.status(201).json({
            success:true,message:'Your account has been created successfully',result
        })
    }catch(error){
        console.log(error)
    }
}

exports.signin=async(req,res)=>{
    const {email,password}=req.body
    try{
        const {error,value}=signinSchema.validate({email,password})
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }

        const existingUser=await User.findOne({email}).select('+password')
        if(!existingUser){
            return res.status(401).json({success:false,message:'User not exists!'})
        }

        const result=await doHashValidation(password,existingUser.password)
        if(!result){
            return res.status(401).json({success:false,message:'Invalid credentials'})
        }

        const token=jwt.sign({
            userId:existingUser._id,
            email:existingUser.email,
            verified:existingUser.verified
        },process.env.TOKEN_SECRET,{expiresIn:'8h'})

        res
            .cookie('Authorization','Bearer'+token,{
                expires:new Date(Date.now() + 8 * 3600000),
                httpOnly:process.env.NODE_EVN==='production',
                secure:process.env.NODE_ENV==='production'
            })
            .json({
                success:true,
                token,
                message:'Logged in successfully'
            })
    }
    catch(error){
        console.log(error)
    }
}

exports.signout=async(req,res)=>{
    res
       .clearCookie('Authorization')
       .status(200)
       .json({success:true,message:'Logout successfully!'})
}

exports.sendVerificationCode=async(req,res)=>{
    const {email}=req.body
    try{
        const existingUser=await User.findOne({email})
        if(!existingUser){
            return res  
                .status(404)
                .json({success:false,message:'User doesnot exists!'})
        }
        if(existingUser.verified){
            return res 
                .status(400)
                .json({success:false,message:'You are already verified!'})
        }

        const DigitCode=crypto.randomInt(1000,10000).toString()

        let info=await transport.sendMail({
            from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to:existingUser.email,
            subject:"Verification code",
            html:`<h2>Your verification code is: ${DigitCode}</h2>`
        })

        if(info.accepted[0]===existingUser.email){
            const hashedCodeValue=hmacProcess(DigitCode,process.env.HMAC_VERIFICATION_SECRET_CODE)
            existingUser.verificationCode=hashedCodeValue
            existingUser.verificationCodeValidationTime=Date.now()
            await existingUser.save()
            return res.status(200).json({success:true,message:'Code Sent'})
        }
        return res.status(200).json({success:true,message:'Code Sent Failed'})
    }
    catch(error){
        console.log(error)
    }
}

exports.verifyVerificationCode=async(req,res)=>{
    const {email,providedcode}=req.body
    try{
        const {error,value}=acceptCodeSchema.validate({email,providedcode})
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const codeValue=providedcode.toString()
        const existingUser=await User.findOne({email}).select('+verificationCode +verificationCodeValidationTime')
        if(!existingUser){
            return res.status(401).json({success:false,message:'User doesn\'t exists'})
        }
        if(existingUser.verified){
            return res.status(401).json({success:true,message:'You are already verified'})
        }
        if(!existingUser.verificationCode || !existingUser.verificationCodeValidationTime){
            return res.status(401).json({success:false,message:'Something went wrong!'})
        }
        if(Date.now()-existingUser.verificationCodeValidationTime>5*60*1000){
            return res.status(401).json({success:false,message:'Code has been expired!'})
        }
        const hashedCodeValue=hmacProcess(codeValue,process.env.HMAC_VERIFICATION_SECRET_CODE)
        if(hashedCodeValue===existingUser.verificationCode){
            existingUser.verified=true,
            existingUser.verificationCode = undefined,
            existingUser.verificationCodeValidationTime=undefined
            await existingUser.save()
            return res.status(200).json({success:true,message:'Your account has been verified!'})
        }
        return res.status(400).json({success:false,message:'Unexpected occured!'})
    }
    catch(error){
        console.log(error)
    }
}

exports.changePassword=async(req,res)=>{
    const {userId,verified}=req.user
    const {oldPassword,newPassword}=req.body
    try{
        const {error,value}=changePasswordSchema.validate({newPassword,oldPassword})
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const existingUser=await User.findOne({_id:userId}).select('+password')
        if(!existingUser){
            return res.status(401).json({success:false,message:'User doesn\'t exists'})
        }
        const result=await doHashValidation(oldPassword,existingUser.password)
        if(!result){
            return res.status(401).json({success:false,message:'Invalid credentials'})
        }
        const hashedPassword=await doHash(newPassword,12)
        existingUser.password=hashedPassword
        await existingUser.save()
        return res.status(200).json({success:true,message:'Password updated'})
    }
    catch(error){
        console.log(error)
    }
}

exports.sendForgotPasswordCode=async(req,res)=>{
    const {email}=req.body
    try{
        const existingUser=await User.findOne({email})
        if(!existingUser){
            return res  
                .status(404)
                .json({success:false,message:'User doesnot exists!'})
        }

        const DigitCode=crypto.randomInt(1000,10000).toString()

        let info=await transport.sendMail({
            from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to:existingUser.email,
            subject:"Verification code",
            html:`<h2>Your verification code is: ${DigitCode}</h2>`
        })

        if(info.accepted[0]===existingUser.email){
            const hashedCodeValue=hmacProcess(DigitCode,process.env.HMAC_VERIFICATION_SECRET_CODE)
            existingUser.forgotPasswordCode=hashedCodeValue
            existingUser.forgotPasswordCodeValidationTime=Date.now()
            await existingUser.save()
            return res.status(200).json({success:true,message:'Code Sent'})
        }
        return res.status(200).json({success:true,message:'Code Sent Failed'})
    }
    catch(error){
        console.log(error)
    }
}

exports.verifyForgetPasswordCode=async(req,res)=>{
    const {email,providedcode,newPassword}=req.body
    try{
        const {error,value}=acceptForgotPasswordCodeSchema.validate({email,providedcode,newPassword})
        if(error){
            return res.status(401).json({success:false,message:error.details[0].message})
        }
        const codeValue=providedcode.toString()
        const existingUser=await User.findOne({email}).select('+forgotPasswordCode +forgotPasswordCodeValidationTime +password')
        if(!existingUser){
            return res.status(401).json({success:false,message:'User doesn\'t exists'})
        }
        if(!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidationTime){
            return res.status(401).json({success:false,message:'Something went wrong!'})
        }
        if(Date.now()-existingUser.forgotPasswordCodeValidationTime>5*60*1000){
            return res.status(401).json({success:false,message:'Code has been expired!'})
        }
        const hashedCodeValue=hmacProcess(codeValue,process.env.HMAC_VERIFICATION_SECRET_CODE)
        if(hashedCodeValue===existingUser.forgotPasswordCode){
            const hashedPassword=await doHash(newPassword,12)
            existingUser.password=hashedPassword
            existingUser.forgotPasswordCode = undefined
            existingUser.forgotPasswordCodeValidationTime=undefined
            await existingUser.save()
            return res.status(200).json({success:true,message:'Your password changed!'})
        }
        return res.status(400).json({success:false,message:'Unexpected occured!'})
    }
    catch(error){
        console.log(error)
    }
}