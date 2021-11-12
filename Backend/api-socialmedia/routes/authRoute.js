const authRoute = require('express').Router();
const responseJSON = require('./../utils/responseJSON');
const User = require('./../models/User');
const bcrypt = require('bcrypt');

// Default auth Route
authRoute.get('/',(req,res)=>{
    res.send('Welcome From Auth Route');
});

// Login User
authRoute.post('/login',async (req,res)=>{
    try{
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json(responseJSON(404,"Email isn't correct..."));

        const validPassword = bcrypt.compare(req.body.password,user.password);
        !validPassword && res.status(404).json(responseJSON(404,"Password isn't correct..."));

        res.status(200).json(responseJSON(200,user));
    }catch(err){
        res.status(500).json(responseJSON(500,err));
    }
})

module.exports = authRoute;