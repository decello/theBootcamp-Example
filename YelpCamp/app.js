const express       = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    mongoose        = require('mongoose'),
    Campground      = require('./models/campground'),
    Comment         = require('./models/comment');
    seedDB          = require('./seeds');


mongoose.connect('mongodb://localhost/yelp_camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

//see the file way.
console.log(__dirname);


app.get("/", function (req, res) {
    res.render("landing");
});

//INDEX - Show all campgrounds
app.get("/campgrounds", function (req, res) {
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err)
        } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    })
});

//CREATE - Add a new campground to DB
app.post("/campgrounds", function (req, res) {
    let name = req.body.name;
    let image = req.body.image;
    let desc = req.body.description;
    let newCampground = {name: name, image: image, description: desc };
    Campground.create(newCampground,function (err, newlyCreated) {
        if(err)
        {
            console.log(err);
        }else{
            res.redirect("campgrounds");
        }
    });
});

//NEW - Show form to create a new campground
app.get("/campgrounds/new", function (req, res) {
    res.render("campgrounds/new");
});


//SHOW - Shows more info about one campground
app.get("/campgrounds/:id", function (req,res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if(err)
        {
            console.log(err);
        }else{
            console.log(foundCampground);
            res.render("campgrounds/show",{campground:foundCampground});

        }
    });
});

app.get("/campgrounds/:id/comments/new",function (req,res) {
    Campground.findById(req.params.id,function (err,campground) {
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground:campground});

        }
    });
});

app.post("/campgrounds/:id/comments",function(req,res){
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else {
            Comment.create(req.body.comment, function (err,comment) {
                if(err){
                    console.log(err);
                }else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});


app.listen(3000, function () {
    console.log("The YelpCamp Server Has Started. ")
});