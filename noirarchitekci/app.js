const express             = require("express"),
    app                   = express(),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    passport              = require("passport"),
    userRoutes           = require("./routes/user"),
    apiRoutes           = require("./routes/api"),
    indexRoutes           = require("./routes/index"),
    projectRoutes           = require("./routes/project"),
    categoryRoutes           = require("./routes/category"),
    User = require("./models/user"),
    LocalStrategy 		  = require("passport-local").Strategy,
    flash                 = require("connect-flash"),
    dotenv                = require("dotenv");
    dotenv.config();

// Connecting to database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

// App configuration
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(methodOverride("_method"));




app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.locals.return_route = req.query.return_route;
	res.locals.route = req.path;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/api",apiRoutes);
app.use(indexRoutes);
app.use("/projects", projectRoutes)
app.use("/projects/category", categoryRoutes)
app.use("/user", userRoutes)


app.listen(process.env.PORT);