const express=require('express')
const authRouter=require('./routers/authRouter.js')
const postRouter=require('./routers/postRouter.js')
const cors=require('cors')
const helmet=require('helmet')
const cookieParser=require('cookie-parser')
const mongoose= require('mongoose')
const app=express()

app.use(cors())
app.use(helmet())
app.use(cookieParser())

// this below middleware order must same that this express.json must above authRouter
app.use(express.json())
app.use('/api/auth',authRouter) 
app.use('/api/posts',postRouter)
// app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log("Database connected")
})
.catch(()=>{
    console.log(err)
})

app.listen(process.env.PORT,()=>{
    console.log(`Example app listening on port ${process.env.PORT}`)
})