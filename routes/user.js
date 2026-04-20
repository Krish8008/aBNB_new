const User = require("../models/user");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveUrl } = require("../middleware");

// ================= GET ROUTES =================
router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

// ================= SIGNUP =================
router.post("/signup", async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        // ✅ FIX: flash BEFORE login
        req.flash("success", "Welcome to aBNB!");

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
});

// ================= LOGIN =================
router.post(
    "/login",
    saveUrl,

    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),

    (req, res) => {
        const redirectUrl = res.locals.redirectUrl || "/listings";
        delete req.session.redirectUrl;

        req.flash("success", "Welcome back!");
        res.redirect(redirectUrl);
    }
);

// ================= LOGOUT =================
router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);

        req.session.destroy(() => {
            res.clearCookie("connect.sid");

            // ⚠️ Flash may not work after destroy, so move before
            // but optional — depends on your flow
            res.redirect("/login");
        });
    });
});

module.exports = router;