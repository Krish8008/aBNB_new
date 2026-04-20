const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const wrapAsync = require("../utilities/wrapAsync");
const Listing = require("../models/listing");
const Review = require("../models/review");

const { reviewSchema } = require("../schema");
const ExpressError = require("../utilities/ExpressError");
const { reviewOwner, isLoggedIn } = require("../middleware");

// ================= VALIDATE REVIEW =================
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }

    next();
};

// ================= ADD REVIEW =================
router.post(
    "/:id/reviews",
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        // ✅ Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid Listing ID");
            return res.redirect("/listings");
        }

        const listing = await Listing.findById(id);

        // ✅ Check listing exists
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;

        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        req.flash("success", "Review added successfully!");
        res.redirect(`/listings/${id}`);
    })
);

// ================= DELETE REVIEW =================
router.delete(
    "/:id/reviews/:reviewId",
    isLoggedIn,
    reviewOwner,
    wrapAsync(async (req, res) => {

        const { id, reviewId } = req.params;

        // ✅ Validate IDs
        if (
            !mongoose.Types.ObjectId.isValid(id) ||
            !mongoose.Types.ObjectId.isValid(reviewId)
        ) {
            req.flash("error", "Invalid ID");
            return res.redirect("/listings");
        }

        await Listing.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId }
        });

        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review deleted successfully!");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;