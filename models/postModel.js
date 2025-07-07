const mongoose=require('mongoose')
// const User=require('../models/userModel')

const postSchema=mongoose.Schema({
    title:{
        type:String,
        required:[true,'title is required']
    },
    description:{
        type:String,
        required:[true,'description is required']
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
},{timestamps:true})

module.exports=mongoose.model('Post',postSchema)