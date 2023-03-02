const express = require("express");

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/web/product.controller");

const router = express.Router();

router.get("/", getProducts);

router.get("/show/:slug", getProduct);

router.get("/create", createProduct);

router.post("/create", createProduct);

router.get("/update/:slug", updateProduct);

router.post("/update/:slug", updateProduct);

router.post("/delete/:slug", deleteProduct);

module.exports = router;
