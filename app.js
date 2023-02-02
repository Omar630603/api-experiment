const express = require("express");

const ProductRoutes = require("./routes/product.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ alive: "True" });
});

app.use("/api", ProductRoutes);

module.exports = app;
