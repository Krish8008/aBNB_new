const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const wrapAsync = require("../utilities/wrapAsync");
const Listing = require("../models/listing");
const { listingSchema } = require("../schema");
const ExpressError = require("../utilities/ExpressError");
const { isLoggedIn, isOwner } = require("../middleware");

const upload = require("../multer");
const cloudinary = require("../cloudConfig");

// ================= VALIDATION =================
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400, errMsg));
    }

    next();
};

// ================= INDEX (🔍 SEARCH ADDED) =================
router.get("/", wrapAsync(async (req, res) => {
    const { search } = req.query;

    let filter = {};

    if (search && search.trim() !== "") {
        filter = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } },
            ]
        };
    }

    const listings = await Listing.find(filter);

    res.render("index", { listings });
}));

// ================= NEW =================
router.get("/new", isLoggedIn, (req, res) => {
    res.render("newListing");
});

// ================= CREATE =================
router.post(
    "/",
    isLoggedIn,
    upload.single("image"),
    validateListing,
    wrapAsync(async (req, res) => {

        const { listing } = req.body;

        const newListing = new Listing({
            ...listing,
            owner: req.user._id,
            image: {
                url: req.file?.path || "https://via.placeholder.com/400",
                filename: req.file?.filename || "default-image",
            },
        });

        await newListing.save();

        req.flash("success", "Listing created successfully!");
        res.redirect("/listings");
    })
);

// ================= EDIT =================
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid Listing ID");
            return res.redirect("/listings");
        }

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        res.render("edit", { listing });
    })
);

// ================= UPDATE =================
router.put(
    "/:id",
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid Listing ID");
            return res.redirect("/listings");
        }

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        Object.assign(listing, req.body.listing);

        if (req.file) {
            if (listing.image.filename !== "default-image") {
                await cloudinary.uploader.destroy(listing.image.filename);
            }

            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await listing.save();

        req.flash("success", "Listing updated!");
        res.redirect(`/listings/${id}`);
    })
);

// ================= DELETE =================
router.delete(
    "/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid Listing ID");
            return res.redirect("/listings");
        }

        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (listing.image.filename !== "default-image") {
            await cloudinary.uploader.destroy(listing.image.filename);
        }

        await Listing.findByIdAndDelete(id);

        req.flash("success", "Listing deleted!");
        res.redirect("/listings");
    })
);

// ================= SHOW =================
router.get(
    "/:id",
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash("error", "Invalid Listing ID");
            return res.redirect("/listings");
        }

        const listing = await Listing.findById(id)
            .populate("reviews")
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        res.render("showListing", { listing });
    })
);

module.exports = router;