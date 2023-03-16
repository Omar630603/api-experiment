const Product = require("../../models/product.model");

const getProducts = async (req, res) => {
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
    return res.render("products/index", {
      title: "API-Experiment | Products",
      products: [],
    });
  }

  return res.render("products/index", {
    title: "API-Experiment | Products",
    products: products,
    message: req.query.message,
  });
};

const getProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .lean()
    .exec();

  if (product === null) {
    const error = { status: 404, message: "No product found" };
    return res.render("error", { title: "API-Experiment | Error", error });
  }

  res.render("products/details", {
    title: "API-Experiment | Product",
    product,
    message: req.query.message,
  });
};

const createProduct = async (req, res) => {
  if (req.method === "GET") {
    return res.render("products/create", {
      title: "API-Experiment | Create Product",
    });
  } else {
    if (
      req.body.name === "" ||
      req.body.price === "" ||
      req.body.description === ""
    ) {
      return res.render("products/create", {
        title: "API-Experiment | Create Product",
        message: "Please fill all fields",
      });
    }
    const FindProduct = await Product.findOne({
      name: req.body.name,
      price: parseInt(req.body.price),
      description: req.body.description,
    })
      .lean()
      .exec();

    if (FindProduct !== null) {
      return res.render("products/create", {
        title: "API-Experiment | Create Product",
        message: "Product already exists",
      });
    }

    await Product.create({
      name: req.body.name,
      price: parseInt(req.body.price),
      description: req.body.description,
    });

    req.query.message = "Product created";
    return await getProducts(req, res);
  }
};

const updateProduct = async (req, res) => {
  if (req.method === "GET") {
    const product = await Product.findOne({ slug: req.params.slug })
      .lean()
      .exec();
    return res.render("products/update", {
      title: "API-Experiment | Update Product",
      product,
    });
  } else {
    if (
      req.body.name === "" ||
      req.body.price === "" ||
      req.body.description === ""
    ) {
      const product = await Product.findOne({ slug: req.params.slug });
      return res.render("products/update", {
        title: "API-Experiment | Update Product",
        product: product,
        message: "Please fill all fields",
      });
    }

    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      {
        name: req.body.name,
        price: parseInt(req.body.price),
        description: req.body.description,
      },
      { new: true }
    );

    if (product === null) {
      const error = { status: 404, message: "No product found" };
      return res.render("error", { error });
    }

    req.query.message = "Product updated";
    return await getProduct(req, res);
  }
};

const deleteProduct = async (req, res) => {
  const product = await Product.findOneAndDelete({ slug: req.params.slug });

  if (product === null) {
    const error = { status: 404, message: "No product found" };
    return res.render("error", { title: "API-Experiment | Error", error });
  }

  req.query.message = "Product deleted";
  return await getProducts(req, res);
};

const getFilters = async (search, price) => {
  price.minPrice = price.minPrice == "" ? 0 : price.minPrice;
  price.maxPrice =
    price.maxPrice == "" || price.maxPrice == 0
      ? (await Product.find().sort({ price: -1 }).limit(1).exec())[0].price
      : price.maxPrice;
  var filter = {};
  search != ""
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
