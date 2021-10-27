const express               = require("express"),
      app                   = express(),
      mongoose              = require("mongoose"),
      bodyParser            = require("body-parser"),
      passport              = require("passport"),
      User          = require("./models/user"),
      Employee          = require("./models/employee"),
      indexRoutes           = require("./routes/index"),
      employeesRoutes       = require("./routes/employee"),
      companiesRoutes       = require("./routes/company"),
      leafletsRoutes       = require("./routes/leaflet"),
      territoriesRoutes     = require("./routes/territory"),
      passportLocalMongoose = require("passport-local-mongoose"),
      LocalStrategy         = require("passport-local"),
      mongoSanitize         = require("express-mongo-sanitize"),
      helmet                = require("helmet"),
      flash                 = require("connect-flash"),
      dotenv                = require("dotenv"),
      methodOverride        = require("method-override");



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(mongoSanitize());
app.use(helmet({
    contentSecurityPolicy: false
}))
dotenv.config();

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})


app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        
    }
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
   
    next();
});
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use("/employees", employeesRoutes);
app.use("/leaflets", leafletsRoutes);
app.use("/companies", companiesRoutes);
app.use("/territories", territoriesRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT)