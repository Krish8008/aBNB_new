const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudConfig");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Airbnb_DEV",
        allowed_formats: ["jpg", "png", "jpeg"]
    }
});

const upload = multer({ storage });

module.exports = upload;