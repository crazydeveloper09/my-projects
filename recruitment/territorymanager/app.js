const express               = require("express"),
      app                   = express(),
      mongoose              = require("mongoose"),
      bodyParser            = require("body-parser"),
      passport              = require("passport"),
      Congregation          = require("./models/congregation"),
      indexRoutes           = require("./routes/index"),
      preachersRoutes       = require("./routes/preacher"),
      territoriesRoutes     = require("./routes/territory"),
      passportLocalMongoose = require("passport-local-mongoose"),
      LocalStrategy         = require("passport-local"),
      flash                 = require("connect-flash"),
      dotenv                = require("dotenv"),
      methodOverride        = require("method-override");



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
dotenv.config();

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})


app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
   
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Congregation.authenticate()));
passport.serializeUser(Congregation.serializeUser());
passport.deserializeUser(Congregation.deserializeUser());

app.use("/preachers", preachersRoutes);
app.use("/territories", territoriesRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT);