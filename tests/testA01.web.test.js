// test the ejs template for the index page

const request = require("supertest");
const app = require("../app");
const puppeteer = require("puppeteer");
const { toMatchImageSnapshot } = require("jest-image-snapshot");
expect.extend({ toMatchImageSnapshot });
const options = {
  showPrefix: false,
  showMatcherMessage: true,
  showStack: false,
};
require("dotenv").config();

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
    slowMo: 0,
    devtools: false,
  });
  page = await browser.newPage();
  await page.setDefaultTimeout(10000);
  await page.setDefaultNavigationTimeout(20000);
});

afterAll(async () => {
  await browser.close();
});

describe("Testing the index page", () => {
  it("should have the right title", async () => {
    const response = await request(app).get("/");
    expect(response.text).toContain("API-Experiment | Home");
  });

  it("should receive a message and display it", async () => {
    const response = await request(app).get("/?message=Hello test");
    expect(response.text).toContain("Hello test");
  });
});

describe("Testing the index page with puppeteer", () => {
  it("should have the right title", async () => {
    await page.goto(`http://localhost:${process.env.PORT}/`);
    const title = await page.title();
    expect(title).toBe("API-Experiment | Home");
  });

  it("should receive a message and display it", async () => {
    await page.goto(`http://localhost:${process.env.PORT}/?message=Hello test`);
    const message = await page.$eval(".message", (el) => el.textContent);
    expect(message).toBe("Hello test");
  });

  it("matches the expected styling", async () => {
    await page.goto(`http://localhost:${process.env.PORT}/`);
    const screenshot = await page.screenshot({ fullPage: true });
    expect(
      screenshot,
      `The web styling for the index page is not correct check the file "/tests/images/__image_snapshots_A01__/__diff_output__/index-page-styling-diff.png" to find the difference`,
      options
    ).toMatchImageSnapshot({
      customDiffConfig: { threshold: 0.1 },
      customSnapshotsDir: "tests/images/__image_snapshots_A01__",
      customSnapshotIdentifier: "index-page-styling",
    });
  });

  it("should have nav bar with 2 links", async () => {
    await page.goto(`http://localhost:${process.env.PORT}/`);
    const navBar = await page.$eval("nav", (el) => el.textContent);
    expect(navBar).toContain("Home");
    expect(navBar).toContain("Products");
  });

  it("should have a button to the products page", async () => {
    await page.goto(`http://localhost:${process.env.PORT}/`);
    await page.click(".btn.btn-primary");
    const url = await page.url();
    expect(url).toBe(`http://localhost:${process.env.PORT}/products`);
  });
});
