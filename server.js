require("dotenv").config();
const express = require("express");
const app = express();
const mongo_url = process.env.MONGO_URL;

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError");

// ROUTES
const listings = require("./routes/listing");
const reviews = require("./routes/review");
const users = require("./routes/user");

// SESSION & AUTH
const session = require("express-session");
const MongoStore = require("connect-mongo"); // ✅ NEW WAY
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

// ================= VIEW ENGINE =================
app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// ================= MIDDLEWARE =================
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ================= DATABASE =================
async function main() {
  try {
    await mongoose.connect(mongo_url);
    console.log("✅ DB Connected");

    app.listen(process.env.PORT || 4000, () => {
      console.log("🚀 Server running on port 3000");
    });

  } catch (err) {
    console.log("❌ DB Error:", err);
  }
}
main();

// ================= SESSION STORE =================
const store = MongoStore.create({
    mongoUrl: mongo_url,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // 1 day
});

// ================= SESSION =================
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    { usernameField: "email" },
    User.authenticate()
));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL LOCALS =================
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.search = req.query.search || "";
    next();
});

// ================= ROUTES =================
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listings);
app.use("/review", reviews);
app.use("/", users);

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    console.log(err);
    res.status(statusCode).send(message);
});