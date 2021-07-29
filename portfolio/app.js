const express             = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    methodOverride        = require("method-override"),
    passport              = require("passport"),
    aboutRoutes           = require("./routes/about"),
    achievementRoutes           = require("./routes/achievement"),
    apiRoutes           = require("./routes/api"),
    announcementRoutes           = require("./routes/announcement"),
    bootcampRoutes           = require("./routes/bootcamp"),
    commentRoutes           = require("./routes/comment"),
    exerciseRoutes           = require("./routes/exercise"),
    ordersRoutes            = require("./routes/orders"),
    indexRoutes           = require("./routes/index"),
    projectRoutes           = require("./routes/project"),
    User = require("./models/user"),
    LocalStrategy 		  = require("passport-local").Strategy,
	cookieParser 		  = require("cookie-parser"),
    flash                 = require("connect-flash"),
	i18n 				  = require("i18n"),
    dotenv                = require("dotenv");
    dotenv.config();

// Connecting to database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

// App configuration
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(methodOverride("_method"));
app.use(cookieParser());

i18n.configure({
    locales: ["en", "de", "pl"],
   	register: global,
	defaultLocale: 'en',
    directory: __dirname + '/locales',
})

app.use(i18n.init);


app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    res.locals.language = i18n;
    res.locals.userLanguage = req.language;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(indexRoutes);
app.use("/api", apiRoutes);
app.use("/website-orders", ordersRoutes)
app.use("/projects", projectRoutes)
app.use("/projects/:project_id/reviews", commentRoutes)
app.use("/about", aboutRoutes)
app.use("/about/:id/achievements", achievementRoutes)
app.use("/announcements", announcementRoutes);
app.use("/bootcamps", bootcampRoutes);
app.use("/bootcamps/:bootcamp_id/exercises", exerciseRoutes);

app.listen(process.env.PORT);