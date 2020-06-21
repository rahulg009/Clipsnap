var express = require("express");
var router  = express.Router();
var User = require("../models/user");
var Campground = require("../models/campground");
var Notification = require("../models/notification");
var middleware = require("../middleware");



router.get("/", function(req, res){
	var noMatch=null;
	if(req.query.search){
		const regex= new RegExp(escapeRegex(req.query.search), 'gi');
		 // Get all campgrounds from DB
		Campground.find({name:regex},function(err,allCampgrounds){
			if(err){
				console.log(err)
			}else{
				if(allCampgrounds.length<1){
					noMatch="No campgrounds match that query, please try again.";
				}
				res.render("campgrounds/index",{campgrounds: allCampgrounds, noMatch:noMatch});
			}
		});
	   }else{
			Campground.find({}, function(err, allCampgrounds){
			   if(err){
				   console.log(err);
			   } else {
				  res.render("campgrounds/index",{campgrounds: allCampgrounds, noMatch:noMatch});
			   }
			});
	   }
});



// //CREATE - add new campground to DB
// router.post("/", middleware.isLoggedIn, function(req, res){
//   // get data from form and add to campgrounds array
//   var name = req.body.name;
//   var image = req.body.image;
//   var desc = req.body.description;
//   var author = {
//       id: req.user._id,
//       username: req.user.username
//   }
  
//     var newCampground = {name: name, image: image, description: desc, author:author};
//     // Create a new campground and save to DB
//     Campground.create(newCampground, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to campgrounds page
//             console.log(newlyCreated);
// 			req.flash("success","Successfully Added");
//             res.redirect("/campgrounds");
//         }
//     });
//   });
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, async function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: desc, author:author}

    try {
      let campground = await Campground.create(newCampground);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        campgroundId: campground.id
      }
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      //redirect back to campgrounds page
      res.redirect("/campgrounds");
    } catch(err) {
		console.log(err)
      req.flash('error', err.message);
      res.redirect('back');
    }
});


//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });

// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/campgrounds");
      } else {
          res.redirect("/campgrounds");
      }
   });
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;