const Listing = require("./models/listing");
const Review = require("./models/review");


const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

const saveUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

const isOwner = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);
    const user = req.user;

    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    // ✅ SAFE CHECKS
    if (!user || !listing.owner || !listing.owner.equals(user._id)) {
        return res.status(403).send("You are not the owner of this listing ❌");
    }

    next();
};

const reviewOwner = async (req, res, next) => {
    let { id, reviewId } = req.params;

    let review = await Review.findById(reviewId);

    // ✅ Check if user is logged in
    if (!req.user) {
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }

    // ✅ Check review exists
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    // ✅ Check ownership
    if (!review.author.equals(req.user._id)) {
        res.send("You are not the owner of this review!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};

module.exports = { isLoggedIn, saveUrl, isOwner, reviewOwner };