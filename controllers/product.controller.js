const Product = require("../models/product.model");

const getProducts = async (req, res) => {
  try {
    var products;

    if (req.query.search || req.query.price) {
      const search = req.query.search;
      const price = req.query.price ?? { minPrice: 0, maxPrice: 0 };

      products = await Product.find({ $and: [await getFilters(search, price)] })
        .lean()
        .exec();
    } else {
      products = await Product.find().lean().exec();
    }

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
      price: parseInt(req.body.price),
      description: req.body.description,
    })
      .lean()
      .exec();

    if (FindProduct !== null) {
      return res
        .status(409)
        .json({ product: FindProduct, message: "Product already exists" });
    }

    const product = await Product.create({
      name: req.body.name,
      price: parseInt(req.body.price),
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
      price: parseInt(req.body.price),
      description: req.body.description,
    };

    const product = await Product.findOneAndUpdate(filter, update, {
      new: true,
    });

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

const getFilters = async (search, price) => {
  price.minPrice = price.minPrice ?? 0;
  price.maxPrice =
    price.maxPrice == null || price.maxPrice == 0
      ? (await Product.find().sort({ price: -1 }).limit(1).exec())[0].price
      : price.maxPrice;
  var filter = {};
  search != null
    ? (filter = {
        $text: { $search: search },
        price: {
          $gte: parseInt(price.minPrice),
          $lte: parseInt(price.maxPrice),
        },
      })
    : (filter = {
        price: {
          $gte: parseInt(price.minPrice),
          $lte: parseInt(price.maxPrice),
        },
      });
  return filter;
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
