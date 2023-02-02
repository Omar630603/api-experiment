const express = require("express");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const router = express.Router();

router.get("/products", getProducts);

router.get("/products/:slug", getProduct);

router.post("/products", createProduct);

router.patch("/products/:slug", updateProduct);

router.delete("/products/:slug", deleteProduct);

module.exports = router;
