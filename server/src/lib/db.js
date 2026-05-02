const mongoose = require("mongoose");

async function connectDb(uri) {
  if (!uri) throw Object.assign(new Error("Missing MONGODB_URI"), { status: 500 });
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

module.exports = { connectDb };

