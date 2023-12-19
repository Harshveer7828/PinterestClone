var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy=require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const upload=require('./multer');
const { model } = require("mongoose");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

// profile route

router.get("/profile", isLoggedIn,async function (req, res, next) {
  const user=await userModel
  .findOne({username:req.session.passport.user})
  .populate("post")
  res.render('profile',{user});
});
router.get("/login",function (req, res, next) {
  res.render('login')
});

router.get("/feed",isLoggedIn,async function(req,res){
  const user= await userModel.findOne({username:req.session.passport.user})
  const post=await postModel.find()
  .populate("user");
  res.render('feed',{user,post});
})

router.get('/add',isLoggedIn,async function (req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user})
  res.render('add',{user});
});
router.post("/createpost",isLoggedIn,upload.single("postimage"),async function (req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user})
  const post=await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  })
  user.post.push(post._id);
  await user.save();
  res.redirect('/profile');
  console.log(user)
});

// multer code

router.post("/fileupload", isLoggedIn,upload.single("image"),async function (req, res, next) {
const user= await userModel.findOne({username:req.session.passport.user})
  user.profileImage=req.file.filename;
  await user.save();
  res.redirect('/profile')
});



// passport default code

router.post("/register", function (req, res) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });
  userModel.register(userData,req.body.password).then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile")
    })
  })
});

router.post('/login',passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/",
}),function(req,res,next){

})

router.get("/logout",function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
