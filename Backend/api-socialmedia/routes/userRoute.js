const userRoute = require('express').Router();
const User = require('./../models/User');
const bcrypt = require('bcrypt');
const responseJSON = require('./../utils/responseJSON');

// User Default Route
userRoute.get('/',(req,res)=>{
    res.send("Welcome From User Route");
});

// Register User
userRoute.post('/register', async(req,res)=>{
    try{
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password,salt);
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword
        });
        const user = await newUser.save();
        res.status(200).json(responseJSON(200,user));
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
});

// Update User
userRoute.put('/:id', async(req,res)=>{
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password,salt);
            }catch(err){
                res.status(500).json(responseJSON(500,err));
            }
        }
        try{
            await User.findByIdAndUpdate(req.params.id,{$set: req.body});
            res.status(200).json(responseJSON(200,"User account has been updated..."));
        }catch(err) {
            res.status(500).json(responseJSON(500,err));
        }
    }else{
        res.status(403).json(responseJSON(403,"You don't have permission or can access only your account..."))
    }
});

// Delete User
userRoute.delete('/:id',async(req,res)=>{
    if(req.params.id === req.body.userId || req.body.isAdmin){
        try{
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json(responseJSON(200,"User account has been deleted..."))
        }catch(err){
            res.status(500).json(responseJSON(500,err));
        }
    }else{
        res.status(403).json(responseJSON((403,"You don't have permission or can access only your account...")))
    }
});

// Get a user
userRoute.get('/:id',async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        const {password,__v,updatedAt,...other} = user._doc;
        res.status(200).json(responseJSON(200,other));
    }catch(err) {
        res.status(500).json(responseJSON(500,err));
    }
});

// Follower/Following Users
userRoute.put('/:id/follow',async(req,res)=>{
    if(req.params.id !== req.body.userId){
        try{
            const user = await User.findById(req.body.userId);
            const currentUser = await User.findById(req.params.id);
            if(!currentUser.followers.includes(req.body.userId)){
                await currentUser.updateOne({$push: {followers: req.body.userId}});
                await user.updateOne({$push: {followings: req.params.id}});
                res.status(200).json(responseJSON(200,"User has been followed"));
            }else{
                res.status(403).json(responseJSON(403,"You have already followed this user..."));
            }
            }catch(err){
                res.status(500).json(responseJSON(500,err));
        }
    }else{
        res.status(403).json(responseJSON(403,"You can't follow yourself..."));
    }
});

// Follower/Following Users
userRoute.put('/:id/unfollow',async(req,res)=>{
    if(req.params.id !== req.body.userId){
        try{
            const user = await User.findById(req.body.userId);
            const currentUser = await User.findById(req.params.id);
            if(currentUser.followers.includes(req.body.userId)){
                await currentUser.updateOne({$pull: {followers: req.body.userId}});
                await user.updateOne({$pull: {followings: req.params.id}});
                res.status(200).json(responseJSON(200,"User has been unfollowed"));
            }else{
                res.status(403).json(responseJSON(403,"You have already unfollowed this user..."));
            }
        }catch(err){
            res.status(500).json(responseJSON(500,err));
        }
    }else{
        res.status(403).json(responseJSON(403,"You can't unfollow yourself..."));
    }
});

module.exports = userRoute;