const Product = require("../models/product.model");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().lean().exec();

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    return res.status(200).json({ products, message: "Products found" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .lean()
      .exec();

    if (product === null) {
      return res.status(404).json({ message: "No product found" });
    }

    res.status(200).json({ product, message: "Product found" });
  } catch (error) {
    res.status(500).json(error);
  }
};

const createProduct = async (req, res) => {
  try {
    const FindProduct = await Product.findOne({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    })
      .lean()
      .exec();

    if (FindProduct !== null) {
      return res
        .status(400)
        .json({ product: FindProduct, message: "Product already exists" });
    }

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    });

    return res.status(201).json({ product, message: "Product created" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const updateProduct = async (req, res) => {
  try {
    const filter = { slug: req.params.slug };
    const update = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
    };

    await Product.findOneAndUpdate(filter, update, {
      new: false,
    });

    const product = await Product.findOne({ slug: req.params.slug });

    if (product === null) {
      return res.status(404).json({ message: "No product found" });
    }

    return res.status(200).json({ product, message: "Product updated" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ slug: req.params.slug });

    if (product === null) {
      return res.status(404).json({ message: "No product found" });
    }

    return res.status(200).json({ product, message: "Product deleted" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
