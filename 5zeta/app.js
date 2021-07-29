const express               = require("express"),
    app                     = express(),
    mongoose                = require("mongoose"),
    User                    = require("./models/user"),
    methodOverride          = require("method-override"),
    passport                = require("passport"),
    atob                    = require("atob"),
    btoa                    = require("btoa"),
    path                    = require('path'),
    fs                      = require('fs'),
    sass                    = require('node-sass'),
    Base64                  = require("js-base64"),
    userRoutes              = require("./routes/user"),
    typeRoutes              = require("./routes/type"),
    categoryRoutes          = require("./routes/category"),
    reviewRoutes          = require("./routes/reviews"),
    announcementRoutes      = require("./routes/announcement"),
    indexRoutes             = require("./routes/index"),
    apiRoutes               = require("./routes/api"),
    LocalStrategy           = require("passport-local").Strategy,
    bodyParser              = require("body-parser"),
    flash                   = require("connect-flash");

require("dotenv").config();

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});





app.use(flash());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"))

app.use(require("express-session")({
    secret: "heheszki",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.currentUser = req.user;
    res.locals.atob = atob;
    res.locals.btoa = btoa;
    res.locals.base64 = Base64;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

let canSave = true; // Because the file change in my system will trigger twice, so you need to control the odd number of times to save, even times can not, actually adjust to each person's computer
 let watch = fs.watch (
  path.resolve('./public'),
  function (type, filename) {
   // console.log('type: ', type, ' filename: ', filename)
})
 watch.on('change', function (type, filename) { // trigger change event, file changes, note that this behavior may be different in different systems
    if (canSave) { // Here is a single save process, because in my system one change triggers two changes
    saveCss(filename)
  }
  canSave = !canSave
})
 function saveCss (filename) { // Convert using the node-sass module and save to the css folder
     let suffix = path.extname(filename) // suffix name
  if (suffix !== '.sass') return
  let outputName = path.resolve('./public/', path.basename(filename, suffix) + '.css')
  sass.render({
    file: path.resolve('./public', filename),
    outFile: outputName,
    outputStyle: 'compressed',
    sourceMap: true
  }, function (err, result) {
    if (err) {
      console.log('sass render err -> ', err)
    } else {
      fs.writeFile(outputName, result.css, function(err){
        if (err) {
          console.log('write file err -> ', err)
        } else {
          console.log('save css success -> ', outputName)
        }
      });
    }
  })
}

app.use("/user", userRoutes);
app.use("/user/:user_username/reviews", reviewRoutes);
app.use("/api", apiRoutes)
app.use("/announcements/type", typeRoutes);
app.use("/announcements/category", categoryRoutes);
app.use("/announcements", announcementRoutes);


app.use(indexRoutes);


app.listen(process.env.PORT, () => {
    console.log("Server started")
});



