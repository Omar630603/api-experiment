const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const packages = require("../package.json");

require("dotenv").config();
mongoose.set("strictQuery", true);

beforeAll(async () => {
  await connectDB().then(
    async () => {
      console.log("Database connected successfully");
    },
    (err) => {
      console.log("There is problem while connecting database " + err);
    }
  );
});

describe("Testing application configuration", () => {
  it("should have the right name and packages", (done) => {
    expect(packages.name).toBe("api-experiment");
    expect(packages.version).toBe("1.0.0");
    expect(packages.devDependencies).toHaveProperty("cross-env");
    expect(packages.devDependencies).toHaveProperty("jest");
    expect(packages.devDependencies).toHaveProperty("nodemon");
    expect(packages.devDependencies).toHaveProperty("supertest");
    expect(packages.dependencies).toHaveProperty("dotenv");
    expect(packages.dependencies).toHaveProperty("express");
    expect(packages.dependencies).toHaveProperty("mongoose");
    done();
  });

  it("should have the right environment variables", (done) => {
    expect(process.env).toHaveProperty("MONGODB_URI");
    expect(process.env).toHaveProperty("MONGODB_URI_TEST");
    expect(
      process.env.MONGODB_URI !== process.env.MONGODB_URI_TEST
    ).toBeTruthy();
    expect(process.env).toHaveProperty("PORT");
    expect(process.env.NODE_ENV).toBe("test");
    done();
  });

  it("should have the right database connection", (done) => {
    expect(mongoose.connection.name).toBe("api-experiment-test");
    expect(mongoose.connection.readyState).toBe(1);
    done();
  });

  it("should be using json format and express framework", (done) => {
    let application_stack = [];
    app._router.stack.forEach((element) => {
      application_stack.push(element.name);
    });
    expect(application_stack).toContain("query");
    expect(application_stack).toContain("expressInit");
    expect(application_stack).toContain("jsonParser");
    expect(application_stack).toContain("urlencodedParser");
    done();
  });
});

describe("Testing GET /", () => {
  it("should return alive", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.alive).toBe("True");
    expect(res.req.method).toBe("GET");
    expect(res.type).toBe("application/json");
  });

  it("should return message", async () => {
    const res = await request(app).get("/").send({ message: "Hello" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Hello");
    expect(res.req.method).toBe("GET");
    expect(res.type).toBe("application/json");
  });
});

afterAll(async () => {
  await disconnectDB();
});

async function connectDB() {
  return mongoose.connect(process.env.MONGODB_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

async function disconnectDB() {
  await mongoose.connection.close();
}
