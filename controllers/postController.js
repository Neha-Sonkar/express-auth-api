const Post = require("../models/postModel")
const {createPostsSchema,deletePostsSchema}=require('../middlewares/validator.js')

exports.getPosts=async(req,res)=>{
    const {page}=req.query
    const postsPerPage=10
    try{
        let pageNum=0
        if(page<=1){
            pageNum=0
        }else{
            pageNum=page-1
        }

        const result=await Post.find().sort({createdAt:-1}).skip(pageNum*postsPerPage).limit(postsPerPage).populate({
            path:'userId',
            select:'email'
        })
        res.status(200).json({ success: true, message: 'posts', data: result })
    }catch(error){
        console.log(error)
    }
}

exports.createPosts=async(req,res)=>{
    const {title,description}=req.body
    const {userId}=req.user
 
    try{
        const {error,value}=createPostsSchema.validate({title,description,userId})
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message})
        }
        const result=Post.create({title,description,userId})
        return res.status(201).json({success: true, message: 'created post',data:result})
    }
    catch(error){
        console.log(error)
    }
}

exports.getSinglePosts=async(req,res)=>{
    const {_id}=req.query
    try{
        const existingPost=await Post.findOne({_id}).populate({
            path:'userId',
            select:'email'
        })
        if(!existingPost){
            res.status(404).json({ success: false, message: 'Post unavailable', data: existingPost })
        }
        res.status(200).json({ success: true, message: 'Single posts', data: existingPost })
    }catch(error){
        console.log(error)
    }
}

exports.updatePost=async(req,res)=>{
    const {title,description}=req.body
    const {userId}=req.user
    const {_id}=req.query

    try{
        const {error,value}=createPostsSchema.validate({title,description,userId})
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message})
        }
        const existingPost=await Post.findOne({_id})
        if(!existingPost){
            res.status(404).json({ success: false, message: 'Post unavailable' })
        }
        if(existingPost.userId.toString()!==userId){
            res.status(404).json({ success: false, message: 'Unauthorized access' })
        }
        existingPost.title=title
        existingPost.description=description
        const result=await existingPost.save()
        return res.status(201).json({success: true, message: 'Post Updatedt',data:result})
    }
    catch(error){
        console.log(error)
    }
}

exports.deletePost=async(req,res)=>{
    const {userId}=req.user
    const {_id}=req.query

    try{
        const {error,value}=deletePostsSchema.validate({userId})
        if(error){
            return res.status(401).json({success: false, message: error.details[0].message})
        }
        const existingPost=await Post.findOne({_id})
        if(!existingPost){
            res.status(404).json({ success: false, message: 'Post unavailable' })
        }
        if(existingPost.userId.toString()!==userId){
            res.status(404).json({ success: false, message: 'Unauthorized access' })
        }
        await Post.deleteOne({_id})
        return res.status(201).json({success: true, message: 'Post deleted'})
    }
    catch(error){
        console.log(error)
    }
}