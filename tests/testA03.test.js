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

describe("POST /api/v1/product", () => {
  it("should create a product", async () => {
    const res = await request(app).post("/api/v1/product").send({
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
    const res = await request(app).post("/api/v1/product").send({
      name: "Product 3",
      price: 1009,
      description: "Description 3",
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Product already exists");
    expect(res.body.product.name).toBe("Product 3");
  });

  it("should not create a product because of the name is not provided", async () => {
    const res = await request(app).post("/api/v1/product").send({
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
    const res = await request(app).post("/api/v1/product").send({
      name: "Product 4",
      price: "",
      description: "Description 4",
    });
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toContain("Cast to Number failed");
  });

  it("should not create a product because of the description is not provided", async () => {
    const res = await request(app).post("/api/v1/product").send({
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
    const res = await request(app).post("/api/v1/product").send({
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
      const res = await request(app).post("/api/v1/product").send({
        name: "Product 4",
        price: 1009,
        description: "Description 4",
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
