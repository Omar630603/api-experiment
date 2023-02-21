const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const Product = require("../models/product.model");

require("dotenv").config();
mongoose.set("strictQuery", false);

beforeAll(async () => {
  await connectDB(process.env.MONGODB_URI_TEST).then(
    async () => {
      await createProducts();
    },
    (err) => {
      console.log("There is problem while connecting database " + err);
    }
  );
});

describe("GET /api/v1/products", () => {
  it("should return all products", async () => {
    const res = await request(app).get("/api/v1/products");
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
    await disconnectDB().then(async () => {
      await connectDB(process.env.MONGODB_URI).then(async () => {
        const products = await Product.find();
        expect(products.length).toBeGreaterThanOrEqual(10);
        await disconnectDB().then(async () => {
          await connectDB(process.env.MONGODB_URI_TEST);
        });
      });
    });
  });

  it("should return no products", async () => {
    await Product.deleteMany();
    const res = await request(app).get("/api/v1/products");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No products found");
    await createProducts();
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).get("/api/v1/products");
      expect(res.statusCode).toBe(500);
      await connectDB(process.env.MONGODB_URI_TEST);
    });
  });
});

describe("GET /api/v1/product/:slug", () => {
  it("should return one product", async () => {
    const res = await request(app).get("/api/v1/product/product-2");
    expect(res.statusCode).toBe(200);
    expect(res.body.product.name).toBe("Product 2");
    expect(res.req.method).toBe("GET");
    expect(res.type).toBe("application/json");
  });

  it("should return no product", async () => {
    const res = await request(app).get("/api/v1/product/product-3");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No product found");
  });

  it("should return error 500", async () => {
    await disconnectDB().then(async () => {
      const res = await request(app).get("/api/v1/product/product-2");
      expect(res.statusCode).toBe(500);
      await connectDB(process.env.MONGODB_URI_TEST);
    });
  });
});

describe("GET /api/v1/products with filters", () => {
  it("should not return any products", async () => {
    const formData = {
      search: "John Doe",
    };
    const res = await request(app).get("/api/v1/products").query(formData);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("No products found");
  });

  it("should return one products that fits the minimum price", async () => {
    const formData = {
      price: {
        minPrice: 200,
      },
    };
    const res = await request(app).get("/api/v1/products").query(formData);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Products found");
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].price).toBeGreaterThanOrEqual(200);
  });

  it("should return one products that fits the maximum price", async () => {
    const formData = {
      price: {
        maxPrice: 1000,
      },
    };
    const res = await request(app).get("/api/v1/products").query(formData);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Products found");
    expect(res.body.products.length).toBe(2);
    expect(res.body.products[0].price).toBeLessThanOrEqual(1000);
  });

  it("should return products", async () => {
    const formData = {
      search: "Product",
      price: {
        minPrice: 200,
        maxPrice: 1000,
      },
    };
    const res = await request(app).get("/api/v1/products").query(formData);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Products found");
    expect(res.body.products.length).toBe(1);
    res.body.products.forEach((product) => {
      expect(product.price).toBeGreaterThanOrEqual(200);
      expect(product.price).toBeLessThanOrEqual(1000);
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

async function connectDB(url) {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function disconnectDB() {
  await mongoose.connection.close();
}
