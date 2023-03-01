const express = require("express");
const apiProductRoutes = require("./routes/api/product.routes");
const webProductRoutes = require("./routes/web/products.routes");
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/styles", express.static(path.join(__dirname, "web", "styles")));
app.set("views", path.join(__dirname, "web", "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  try {
    if (req.query.message) {
      return res.render("index", { message: req.query.message });
    } else {
      return res.render("index");
    }
  } catch (err) {
    return res.render("error", err);
  }
});

app.use("/", webProductRoutes);

app.get("/api/v1/test", (req, res) => {
  if (req.body.message) {
    res.status(200).json({ message: req.body.message });
  } else {
    res.status(200).json({ alive: "True" });
  }
});

app.use("/api/v1", apiProductRoutes);

module.exports = app;
