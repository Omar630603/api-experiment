const express = require("express");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/web/product.controller");

const router = express.Router();

router.get("/products", getProducts);

router.get("/product/:slug", getProduct);

router.post("/product", createProduct);

router.patch("/product/:slug", updateProduct);

router.delete("/product/:slug", deleteProduct);

module.exports = router;
