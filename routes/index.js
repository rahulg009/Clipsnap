var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var Notification = require("../models/notification");
var middleware = require("../middleware");


//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});



//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
		{
			username: req.body.username,
			firstName:req.body.firstName,
			lastName:req.body.lastName,
			email:req.body.email,
			avatar:req.body.avatar
			
		 
		}
	);
	
	if(req.body.adminCode ===process.env.ADMIN){
		newUser.isAdmin=true;
	}
	
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/campgrounds"); 
        });
    });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handling login logic
router.post("/login", passport.authenticate("local", 
    {
		
        successRedirect: "/campgrounds",
	
        failureRedirect: "/login",
		failureFlash: true,
        successFlash: "Hello,Nice to meet you!"
    }), function(req, res){
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("error", "Logged you out!");
   res.redirect("/campgrounds");
});



router.get("/users/:id", async function(req, res){
    try{
        let user = await User.findById(req.params.id).populate("followers").exec();
        let campgrounds = await Campground.find().where("author.id").equals(user._id).exec();
        res.render("users/show", { user, campgrounds });
    } catch(err){
        req.flash("error", err.message);
        return res.redirect("back");
    }
});

// follow user
router.get('/follow/:id',middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash("success", 'Successfully followed ' + user.username + '!');
    res.redirect("/users/" + req.params.id);
  } catch(err) {
    req.flash("error", err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    let allNotifications = user.notifications;
    res.render('notifications/index', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id',middleware.isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/campgrounds/${notification.campgroundId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});






module.exports = router;