const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const jwtKey = process.env.JWTKEY
const User = require('../Models/user')
const Team = require('../Models/team')
// for login
router.post('/userLogin',async(req,res)=>{
    const {email,password} = req.body;
    if(!(email.trim(' ')&&password.trim(' '))){
        res.status(200).json({error:"email or password not found"});
        return
    }
    let flag=0;
    // password length validation
    if(password.trim(' ').length<8){
        res.status(200).json({error:"Minimum length of password should be 8 character"});
        return;
    }
    // email validation
    for(let i=0;i<email.length;i++){
        console.log(email.charAt(i))
        if(email.charAt(i)=='@'){
            flag+=1;
            break;
        }
    }
    if(flag==0){
        res.status(200).json({error:"email is Invalid"});
        return
    }
    const user = await User.findOne({email:email,password:password});
    if(!user){
        res.status(200).json({error:"email or password is incorrect"});
        return;
    }
    jwt.sign({email,password},jwtKey,{expiresIn:"2h"},(err,token)=>{
        if(err){
            res.status(400).json({error:"server error try after sometime"});
            return;
        }
        res.status(200).json({user:user,auth:token});
    })
})

// for signup
router.post('/userSignup',async(req,res)=>{
    const {name,email,password} = req.body;
    if(!(email.trim(' ')&&password.trim(' ')&&name.trim(' '))){
        res.status(401).json({error:"invalid format form filled"});
        return
    }
    let flag=0;
    // password length validation
    if(password.trim(' ').length<8){
        res.status(200).json({error:"Minimum length of password should be 8 character"});
        return;
    }
    // email validation
    for(let i=0;i<email.length;i++){
        console.log(email.charAt(i))
        if(email.charAt(i)=='@'){
            flag+=1;
            break;
        }
    }
    if(flag==0){
        res.status(200).json({error:"email is Invalid"});
        return
    }
    try{
        const newuser =await User.create({email:email,password:password,name:name});
        jwt.sign({newuser},jwtKey,{expiresIn:"2h"},(err,token)=>{
            if(err){
                res.status(400).json({error:"server error try after sometime"});
                return
            }
            res.status(200).json({user:newuser,auth:token});
        })
    }
    catch(error){
        res.status(400).json({error:error.errmsg});
        console.log(error);
        return
    }
})
//get user data
router.get("/data/:id",jwtVerify,async(req,res)=>{
    const {id} = req.params;
    if(!id){
        res.status(200).json({error:"Invalid Id passed login again"});
        return;
    }
    try {
        const user = await User.findById(id);
        if(!user){
            res.status(200).json({error:"User not found try login/signup"});
            return;
        }
        res.status(200).json({user});

    } catch (error) {
        res.status(400).json({error:error.errmsg});
        return;
    }
})



// new task update
router.post("/newtask/:id",jwtVerify,async(req,res)=>{
    const {id} = req.params;
    const {taskname,taskstatus}=req.body
    console.log(req.body)
    try{
        const updateUser = await User.findById(id)
            if(!updateUser){
                res.status(200).json({error:"user not found try login again"});
                return;
            }
            const newtask = {taskname,taskstatus};
            updateUser.tasks.push(newtask);
            await updateUser.save();
            res.status(200).json({user:updateUser});    }
    catch(error){
        console.log(error);
        res.status(400).json({ error: "Internal Server Error" });
    }
});

// task status update
router.patch("/status/:id/:taskId",jwtVerify,async(req,res)=>{
    console.log("hit")
    const {id,taskId} = req.params;
    const {newtaskstatus} = req.body;
    if(!(newtaskstatus==true||newtaskstatus==false)){
        res.status(200).json({error:"new task status is invalid"})
        return;
    }
    try{
    const user= await User.findOne({_id:id});
    if(user){
        const taskindex= user.tasks.findIndex(t=>t._id.equals(taskId));
        user.tasks[taskindex].taskstatus = newtaskstatus;
        const newtasks = user.tasks;
        const newprofile = {...user,tasks:newtasks}
        console.log(newprofile)
        const newuser = await User.findByIdAndUpdate(id,newprofile,{new:true})
        res.status(200).json({user:newuser});
    }else{
        console.log("unable to find user try login again");
        res.status(200).json({error:"unable to find user try login again"})

    }}
    catch(error){
        console.log(error);
        res.status(400).json({error:"Internal server error try after sometime"})

    }
})

//delete task
router.delete("/delete/:id/:taskId",jwtVerify,async(req,res)=>{
    const {id,taskId} = req.params;
    try{
    const user= await User.findOne({_id:id});
    if(user){
        const name = user.name;
        const email = user.email;
        const password = user.password;
        const newtasks= user.tasks.filter(t=>!t._id.equals(taskId));
        const newprofile = {name:name,email:email,password:password,tasks:newtasks}
        console.log(newprofile)
        const newuser = await User.findByIdAndUpdate(id,newprofile,{new:true})
        res.status(200).json({user:newuser});
        return
    }else{
        res.status(200).json({error:"user is not found try logging again"});
        return
    }}
    catch(error){
        console.log(error)
        res.status(400).json({error:"Internal server error try after sometime"})

    }
})
// create team room
router.get('/create-team/:groupId',async(req,res)=>{
    const {groupId} = req.params;
    if(!/^\d+$/.test(groupId)){
        res.status(200).json({error:"Enter numeric value only"})
        return;
    }
    if(!groupId){
        res.status(200).json({error:"empty group Id try again"})
        return;
    }
    try {
        const team = await Team.create({groupId});
        res.status(200).json(team);
        return;
    } catch (error) {
        let val;
        async function retry(){
            val = Math.floor((Math.random() * 100000) + 1);
            const verify = await Team.findOne({groupId:val});
            if(verify){
                retry();
            }
            else{
                return ;
            }
        }
        if(error.errmsg.split(' ')[0]=='E11000'){
            retry();
            res.status(400).json({error:"Kindly choose another Group Id this is already in use "+`Try - ${val}`})
            return
        }
        res.status(400).json({error:error.errmsg})
    }
})
// get room data
router.get('/team/:groupId',async(req,res)=>{
    const {groupId} = req.params;
    if(!/^\d+$/.test(groupId)){
        res.status(200).json({error:"Enter numeric value only"})
        return;
    }
    try {
        if(!groupId){
            res.status(200).json({error:"Invalid Room number"})
            return;
        }
        const team = await Team.findOne({groupId});
        if(!team){
            res.status(200).json({error:`Room not found with groupId:${groupId}`});
            return;
        }
        res.status(200).json({team:team});
    } catch (error) {
        res.status(400).json({error:error.errmsg})
    }
    
})

// create task
router.post("/team/newtask/:groupId",async(req,res)=>{
    const {groupId} = req.params;
    const {taskname,taskstatus}=req.body
    try{
        const updateTeam = await Team.findOne({groupId})
            if(!updateTeam){
                res.status(200).json({error:"room not found try joining again"});
                return;
            }
            const newtask = {taskname,taskstatus};
            updateTeam.tasks.push(newtask);
            await updateTeam.save();
            res.status(200).json({team:updateTeam});    }
    catch(error){
        console.log(error);
        res.status(400).json({ error: "Internal Server Error" });
    }
});

// change status of task
router.patch("/team/status/:groupId/:taskId",async(req,res)=>{
    const {groupId,taskId} = req.params;
    const {newtaskstatus} = req.body;
    if(!(newtaskstatus==true||newtaskstatus==false)){
        res.status(200).json({error:"new task status is invalid"})
        return;
    }
    try{
    const team= await Team.findOne({groupId});
    if(team){
        const taskindex= team.tasks.findIndex(t=>t._id.equals(taskId));
        team.tasks[taskindex].taskstatus = newtaskstatus;
        const newtasks = team.tasks;
        const newformat = {...team,tasks:newtasks}
        const newteam = await Team.findOneAndUpdate({groupId},newformat,{new:true})
        res.status(200).json({team:newteam});
    }else{
        console.log("unable to find team try login again");
        res.status(200).json({error:"unable to find team try login again"})

    }}
    catch(error){
        console.log(error);
        res.status(400).json({error:"Internal server error try after sometime"})

    }
})

// delete task

router.delete("/team/delete/:groupId/:taskId",async(req,res)=>{
    const {groupId,taskId} = req.params;
    try{
    const team= await Team.findOne({groupId});
    if(team){
        const newgroupId = team.groupId;
        const newtasks= team.tasks.filter(t=>!t._id.equals(taskId));
        const newprofile = {groupId:newgroupId,tasks:newtasks}
        console.log(newprofile)
        const newteam = await Team.findOneAndUpdate({groupId},newprofile,{new:true})
        res.status(200).json({team:newteam});
        return
    }else{
        res.status(200).json({error:"Invalid room Id try again"});
        return
    }}
    catch(error){
        console.log(error)
        res.status(400).json({error:"Internal server error try after sometime"})

    }
})



// middle

function jwtVerify(req,res,next){

    const tokenbody = req.headers['authorization'];
    if (!tokenbody) {
        res.status(401).json({error:"Invalid authorization"})
        return
    }
    const token = tokenbody.split(' ')[1];
    jwt.verify(token,jwtKey,(err,valid)=>{
        if(err){
            console.log(err)
            res.status(401).json({error:"Login expired kindly login again first"})
            return
        }
        next();
    })

}


module.exports=router;