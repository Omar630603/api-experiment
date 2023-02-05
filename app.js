const express = require("express");

const productRoutes = require("./routes/product.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ alive: "True" });
});

app.use("/api/v1", productRoutes);

module.exports = app;
