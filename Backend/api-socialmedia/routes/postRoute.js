const postRoute = require('express').Router();
const User = require('./../models/User');
const Post = require('./../models/Post');
const responseJSON = require('./../utils/responseJSON');

// Post Deafult Route
postRoute.get('/',(req,res)=>{
    res.send('Welcome From Post Route');
});

// Create a Post
postRoute.post('/', async(req,res)=>{
    try{
        const user = await User.findById(req.body.userId);
        if(user === null)
            return res.status(404).json(responseJSON(404,"User doesn't have..."));

        const newPost = new Post(req.body);
        const post = await newPost.save();
        res.status(200).json(responseJSON(200,post));
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
});

// Update a Post
postRoute.put('/:id',async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await Post.updateOne({$set: req.body});
            res.status(200).json(responseJSON(200,"The post has been updated..."));
        }else{
            res.status(403).json(responseJSON(403,"You can't access or update only your post..."));
        }
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
});

// Delete a Post
postRoute.delete('/:id',async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId){
            await post.deleteOne();
            res.status(200).json(responseJSON(200,"The post has been deleted..."));
        }else{
            res.status(403).json(responseJSON(403,"You can't access or delete only your post..."));
        }
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
});

// Get a Post
postRoute.get('/:id', async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(responseJSON(200,post));
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
});

// Timeline User's Post
postRoute.get('/timeline/all',async(req,res)=>{
    try{
        const timelineUser = await User.findById(req.body.userId);
        const posts = await Post.find({userId: timelineUser._id});
        const friendPosts = await Promise.all(
            timelineUser.followings.map((friendId)=>{
                return Post.find({userId: friendId});
            })
        );
        res.status(200).json(responseJSON(200,posts.concat(...friendPosts)))
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
});

// Like/Dislike a post
postRoute.put('/:id/like',async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json(responseJSON(200,"The post has been liked..."))
        }else{
           await post.updateOne({$pull:{likes:req.body.userId}});
            res.status(200).json(responseJSON(200,"The post has been disliked..."))
        }
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
})

module.exports = postRoute;