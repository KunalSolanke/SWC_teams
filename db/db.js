const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  useFindAndModify: true,
});
const db = mongoose.connection;
db.on("error", (err) => {
  console.log(err);
});
db.on("open", () => {
  console.log("Db is connected".underline.green);
});





module.exports = db;
