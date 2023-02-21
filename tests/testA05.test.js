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

describe("DELETE /api/v1/products/:slug", () => {
  it("should delete a product", async () => {
    const product = await Product.findOne({ slug: "product-3" }).lean().exec();
    const res = await request(app).delete("/api/v1/product/product-3");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product deleted");
    expect(res.body.product.name).toBe("Product 3");
    const checkProduct = await Product.findById(product._id).lean().exec();
    expect(checkProduct).toBeNull();
    expect(res.req.method).toBe("DELETE");
    expect(res.type).toBe("application/json");
  });

  it("should not delete a product because it does not exist", async () => {
    const res = await request(app).delete("/api/v1/product/product-3");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No product found");
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).delete("/api/v1/product/product_4");
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
    },
    {
      name: "Product 3",
      price: 1009,
      description: "Description 3",
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
