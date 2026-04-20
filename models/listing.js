const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const cloudinary = require("../cloudConfig");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
    },

    description: {
        type: String,
        required: true,
        minlength: 5,
    },

    image: {
        url: {
            type: String,
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX1RDyP9DPvpv-LCI1YV70RMprFR2LfhGfZQ&s",
        },
        filename: {
            type: String,
            default: "default-image",
        },
    },

    price: {
        type: Number,
        required: true,
        min: 1,
    },

    location: {
        type: String,
        required: true,
    },

    country: {
        type: String,
        required: true,
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

}, { timestamps: true });


// 🔥 DELETE HOOK (Reviews + Cloudinary Image)
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {

        // delete all related reviews
        await Review.deleteMany({
            _id: { $in: listing.reviews },
        });

        // delete image from Cloudinary
        if (
            listing.image &&
            listing.image.filename &&
            listing.image.filename !== "default-image"
        ) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }
    }
});


// 🚀 EXPORT
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;