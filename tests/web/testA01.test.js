const request = require("supertest");
const app = require("../../app");
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
    defaultViewport: {
      width: 1024,
      height: 768,
    },
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
  beforeEach(async () => {
    await page.goto(`http://localhost:${process.env.PORT}/`);
  });

  it("should have the right title", async () => {
    const title = await page.title();
    expect(title, "The title for the web page is wrong", options).toBe(
      "API-Experiment | Home"
    );
  });

  it("should receive a message and display it", async () => {
    await page.goto(`http://localhost:${process.env.PORT}/?message=Hello test`);
    const message = await page.$eval(".message", (el) => el.textContent);
    expect(
      message,
      `the message "${message}" received is wrong it should be "Hello test"`,
      options
    ).toBe("Hello test");
  });

  it("the products button should have the right styling", async () => {
    const backgroundColor = await page.evaluate(() => {
      const button = document.querySelector(".btn.btn-primary");
      const style = window.getComputedStyle(button);
      return style.getPropertyValue("background-color");
    });
    expect(backgroundColor).toBe("rgb(0, 161, 189)");
  });

  it("matches the expected styling", async () => {
    const button = await page.$(".btn.btn-primary");
    const screenshot = await button.screenshot({
      boundingBox: await button.boundingBox(),
    });
    expect(
      screenshot,
      `The web styling for the index page is not correct check the file "/tests/images/__diff_output__/index-page-button-products-diff.png" to find the difference`,
      options
    ).toMatchImageSnapshot({
      customDiffConfig: { threshold: 0.1 },
      customSnapshotsDir: "tests/images",
      customSnapshotIdentifier: "index-page-button-products",
    });
  });

  it("matches the expected styling", async () => {
    const screenshot = await page.screenshot({ fullPage: true });
    expect(
      screenshot,
      `The web styling for the index page is not correct check the file "/tests/images/__diff_output__/index-page-diff.png" to find the difference`,
      options
    ).toMatchImageSnapshot({
      customDiffConfig: { threshold: 0.1 },
      customSnapshotsDir: "tests/images",
      customSnapshotIdentifier: "index-page",
    });
  });

  it("should have nav bar with 2 links", async () => {
    const navBar = await page.$eval("nav", (el) => el.textContent);
    expect(navBar).toContain("Home");
    expect(navBar).toContain("Products");
  });

  it("should have a button to the products page", async () => {
    await page.click(".btn.btn-primary");
    const url = await page.url();
    expect(url).toBe(`http://localhost:${process.env.PORT}/products`);
  });

  it("match index-page snapshot", async () => {
    const html = await page.content();
    expect(html).toMatchSnapshot("index-page");
  });

  it("matches the products button snapshot", async () => {
    const html = await page.evaluate(() => {
      const button = document.querySelector(".btn.btn-primary");
      return button.outerHTML;
    });
    expect(html).toMatchSnapshot("products-button");
  });
});
