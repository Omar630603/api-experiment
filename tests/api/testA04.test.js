const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../../app");
const Product = require("../../models/product.model");

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

describe("PATCH /api/v1/product/:slug", () => {
  it("should update a product", async () => {
    const FindProduct = await Product.findOne({ slug: "product-3" })
      .lean()
      .exec();
    const res = await request(app).patch("/api/v1/product/product-3").send({
      name: "Product 3 updated",
      price: 109,
      description: "Description 3 updated",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product updated");
    expect(FindProduct.price).toBe(1009);
    expect(FindProduct.name).toBe("Product 3");
    expect(FindProduct.description).toBe("Description 3");
    expect(res.body.product.price).toBe(109);
    expect(res.body.product.name).toBe("Product 3 updated");
    expect(res.body.product.description).toBe("Description 3 updated");

    expect(res.req.method).toBe("PATCH");
    expect(res.type).toBe("application/json");
  });

  it("should not update a product because it does not exist", async () => {
    const res = await request(app).patch("/api/v1/product/product_4").send({
      name: "Product 3 updated",
      price: 109,
      description: "Description 3",
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No product found");
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).patch("/api/v1/product/product_4").send({
        name: "Product 3 updated",
        price: 109,
        description: "Description 3",
      });
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
