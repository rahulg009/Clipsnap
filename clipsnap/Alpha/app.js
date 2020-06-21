require('dotenv').config()

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
	flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
	
    User        = require("./models/user"),
	
    seedDB      = require("./seeds")
    
//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")
    
mongoose.connect('mongodb://localhost:27017/yelp_camp_v4', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database
app.locals.moment = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "pikachu!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.use(function(req, res, next){
//    	res.locals.currentUser = req.user;
//   	res.locals.error = req.flash("error");
//    	res.locals.success = req.flash("success");
	
//    	next();
// });

app.use(async function(req, res, next){
   res.locals.currentUser = req.user;
   if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();
    } catch(err) {
      console.log(err.message);
    }
   }
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000,function(){
	console.log("connected");
})


// // ========================================================================================
// mongoose.connect('mongodb://localhost:27017/yelp_camp_v4', {useNewUrlParser: true, useUnifiedTopology: true});
// app.use(require("express-session")({
// 	secret:"pikachu",
// 	resave:false,
// 	saveUninitialized:false
	
// }));
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
// app.use(function(req,res,next){
// 	res.locals.currentUser=req.user;
// 	next();
// })

// // =====================================================================================
// app.get("/", function(req, res){
//     res.render("landing");
// });

// //INDEX - show all campgrounds
// app.get("/campgrounds", function(req, res){
//     console.log(req.user)
//     Campground.find({}, function(err, allCampgrounds){
//        if(err){
//            console.log(err);
//        } else {
//           res.render("campgrounds/index",{campgrounds:allCampgrounds ,currentUser:req.user });
//        }
//     });
// });

// 
// app.post("/campgrounds", function(req, res){
//     // get data from form and add to campgrounds array
//     var name = req.body.name;
//     var image = req.body.image;
//     var desc = req.body.description;
//     var newCampground = {name: name, image: image, description: desc}
	
//    
//     Campground.create(newCampground, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to campgrounds page
//             res.redirect("/campgrounds");
//         }
//     });
// });

// 
// app.get("/campgrounds/new", function(req, res){
//    res.render("campgrounds/new"); 
// });


// app.get("/campgrounds/:id", function(req, res){
    
//     Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
//         if(err){
//             console.log(err);
//         } else {
//             console.log(foundCampground)
    
//             res.render("campgrounds/show", {campground: foundCampground});
//         }
//     });
// });


// // ======================================================================================================
// app.get("/campgrounds/:id/comments/new",isLoggedIn, function(req, res){
//     // find campground by id
//     Campground.findById(req.params.id, function(err, campground){
//         if(err){
//             console.log(err);
//         } else {
//              res.render("comments/new", {campground: campground});
//         }
//     })
// });

// app.post("/campgrounds/:id/comments",isLoggedIn,function(req, res){
   
//    Campground.findById(req.params.id, function(err, campground){
//        if(err){
//            console.log(err);
//            res.redirect("/campgrounds");
//        } else {
//         Comment.create(req.body.comment, function(err, comment){
//            if(err){
//                console.log(err);
//            } else {
//                campground.comments.push(comment);
//                campground.save();
//                res.redirect('/campgrounds/' + campground._id);
//            }
//         });
//        }
//    });
   
// });
// // =======================================================================================================
// app.get("/register",function(req,res){
// 	res.render("register")
// });
// app.post("/register",function(req,res){
// 	var newUser = new User({username:req.body.username})
// 	User.register(newUser,req.body.password,function(err,user){
// 		if(err){
// 			console.log(err);
// 			return res.redirect("/campgrounds")
// 		}
// 		passport.authenticate("local")(req,res,function(){
// 			res.redirect("/campgrounds");
// 		});
// 	});
// });

// app.get("/login",function(req,res){
// 	res.render("login");
// });
// app.post("/login",passport.authenticate("local",{
// 	successRedirect:"/campgrounds",
// 	failureRedirect:"/login"
// }),function(req,res){
// });
// app.get("/logout",function(req,res){
// 	req.logout();
// 	res.redirect("/campgrounds");
// });
// function isLoggedIn(req,res,next){
// 	if(req.isAuthenticated()){
// 		return next()
// 	}else{
// 		res.redirect("/login")
// 	}
// }


