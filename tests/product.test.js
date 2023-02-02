const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Product = require("../models/product.model");

require("dotenv").config();
mongoose.set("strictQuery", false);

beforeAll(async () => {
  await connectDB().then(
    async () => {
      await createProducts();
    },
    (err) => {
      console.log("There is problem while connecting database " + err);
    }
  );
});

describe("GET /", () => {
  it("should return alive", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.alive).toBe("True");
    expect(res.req.method).toBe("GET");
    expect(res.type).toBe("application/json");
  });
});

describe("GET /api/products", () => {
  it("should return all products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Products found");
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(
      res.body.products[0].name === "Product 1" ||
        res.body.products[0].name === "Product 2"
    ).toBeTruthy();
    expect(res.req.method).toBe("GET");
    expect(res.type).toBe("application/json");
  });

  it("should check items in database", async () => {
    expect(await Product.count()).toBeGreaterThan(0);
  });

  it("should return no products", async () => {
    await Product.deleteMany();
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No products found");
    await createProducts();
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).get("/api/products");
      expect(res.statusCode).toBe(500);
      await connectDB();
    });
  });
});

describe("GET /api/products/:slug", () => {
  it("should return one product", async () => {
    const res = await request(app).get("/api/products/product_2");
    expect(res.statusCode).toBe(200);
    expect(res.body.product.name).toBe("Product 2");
    expect(res.req.method).toBe("GET");
    expect(res.type).toBe("application/json");
  });

  it("should return no product", async () => {
    const res = await request(app).get("/api/products/product_3");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No product found");
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).get("/api/products/product_2");
      expect(res.statusCode).toBe(500);
      await connectDB();
    });
  });
});

describe("POST /api/products", () => {
  it("should create a product", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Product 3",
      price: 1009,
      description: "Description 3",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.product.name).toBe("Product 3");
    expect(res.req.method).toBe("POST");
    expect(res.type).toBe("application/json");
  });

  it("should not create a product because it already exists", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Product 3",
      price: 1009,
      description: "Description 3",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Product already exists");
    expect(res.body.product.name).toBe("Product 3");
  });

  it("should not create a product because of the name is not provided", async () => {
    const res = await request(app).post("/api/products").send({
      name: "",
      price: 1009,
      description: "Description 3",
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.errors.name.message).toBe("Name is required");
    expect(res.body.message).toBe(
      "Product validation failed: name: Name is required"
    );
  });

  it("should not create a product because of the price is not provided", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Product 4",
      price: "",
      description: "Description 4",
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.errors.price.message).toBe("Price is required");
    expect(res.body.message).toBe(
      "Product validation failed: price: Price is required"
    );
  });

  it("should not create a product because of the description is not provided", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Product 4",
      price: 1009,
      description: "",
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.errors.description.message).toBe("Description is required");
    expect(res.body.message).toBe(
      "Product validation failed: description: Description is required"
    );
  });

  it("should not create a product because of the price is less than 0", async () => {
    const res = await request(app).post("/api/products").send({
      name: "Product 4",
      price: -1009,
      description: "Description 4",
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.errors.price.message).toBe("Price must be greater than 0");
    expect(res.body.message).toBe(
      "Product validation failed: price: Price must be greater than 0"
    );
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).post("/api/products").send({
        name: "Product 4",
        price: 1009,
        description: "Description 4",
      });
      expect(res.statusCode).toBe(500);
      await connectDB();
    });
  });
});

describe("PATCH /api/products/:slug", () => {
  it("should update a product", async () => {
    const FindProduct = await Product.findOne({ slug: "product_3" })
      .lean()
      .exec();
    const res = await request(app).patch("/api/products/product_3").send({
      name: "Product 3 updated",
      price: 109,
      description: "Description 3",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product updated");
    // old product
    expect(FindProduct.price).toBe(1009);
    expect(FindProduct.name).toBe("Product 3");
    // new product
    expect(res.body.product.price).toBe(109);
    expect(res.body.product.name).toBe("Product 3 updated");

    expect(res.req.method).toBe("PATCH");
    expect(res.type).toBe("application/json");
  });

  it("should not update a product because it does not exist", async () => {
    const res = await request(app).patch("/api/products/product_4").send({
      name: "Product 3 updated",
      price: 109,
      description: "Description 3",
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No product found");
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).patch("/api/products/product_4").send({
        name: "Product 3 updated",
        price: 109,
        description: "Description 3",
      });
      expect(res.statusCode).toBe(500);
      await connectDB();
    });
  });
});

describe("DELETE /api/products/:slug", () => {
  it("should delete a product", async () => {
    const product = await Product.findOne({ slug: "product_3" }).lean().exec();
    const res = await request(app).delete("/api/products/product_3");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product deleted");
    expect(res.body.product.name).toBe("Product 3 updated");
    const checkProduct = await Product.findById(product._id).lean().exec();
    expect(checkProduct).toBeNull();
    expect(res.req.method).toBe("DELETE");
    expect(res.type).toBe("application/json");
  });

  it("should not delete a product because it does not exist", async () => {
    const res = await request(app).delete("/api/products/product_3");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No product found");
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).delete(
        "/api/products/63d6810d0c7579995967eb6d"
      );
      expect(res.statusCode).toBe(500);
      await connectDB();
    });
  });
});

afterAll(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.drop();
  }
  await disconnectDB();
});

async function createProducts() {
  await Product.create(
    {
      name: "Product 1",
      price: 100,
      description: "Description 1",
    },
    {
      name: "Product 2",
      price: 200,
      description: "Description 2",
    }
  );
}

async function connectDB() {
  return mongoose.connect(process.env.MONGODB_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function disconnectDB() {
  await mongoose.connection.close();
}
