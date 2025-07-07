const express=require('express')
const postController=require('../controllers/postController')
const { identifier } = require('../middlewares/identification')
const router=express.Router()

router.post('/create-post',identifier,postController.createPosts)
router.put('/update-post',identifier,postController.updatePost)
router.delete('/delete-post',identifier,postController.deletePost)
router.get('/all-posts',postController.getPosts)
router.get('/single-post',postController.getSinglePosts)

module.exports=router