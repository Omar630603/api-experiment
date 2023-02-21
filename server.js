const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const app = require("./app");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, console.log(`"Server started on port ${PORT}"`));
  })
  .catch((error) => {
    console.log(error);
  });
