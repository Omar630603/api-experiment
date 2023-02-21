const express = require("express");
const productRoutes = require("./routes/product.routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  if (req.body.message) {
    res.status(200).json({ message: req.body.message });
  } else {
    res.status(200).json({ alive: "True" });
  }
});

app.use("/api/v1", productRoutes);

module.exports = app;
