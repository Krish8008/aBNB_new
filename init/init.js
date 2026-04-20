require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

const mongo_url = process.env.MONGO_URL;

async function main() {
  try {
    await mongoose.connect(mongo_url);
    console.log("✅ DB Connected");

    await initDB(); // ✅ CALL HERE (after connection)

  } catch (err) {
    console.log("❌ DB Error:", err);
  }
}

const initDB = async () => {
  await Listing.deleteMany({});

  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("69e5181e0e3eb5be0aa7bea8"),
  }));

  await Listing.insertMany(initData.data);

  console.log("✅ Data Initialized");
};

main();