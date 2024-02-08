import { MongoClient } from "mongodb";
import puppeteer from "puppeteer";
import { setTimeout } from "timers/promises";
import dotenv from "dotenv";
dotenv.config();

const categories = [
  "sports",
  "fashion",
  "lighting",
  "software",
  "books",
  "videogames",
  "toys",
  "lawn-garden",
  "musical-instruments",
  "computers",
  "hpc",
  "electronics",
  "appliances",
  "officeproduct",
  "grocery",
  "dvd",
  "kitchen",
  "industrial",
  "climate-pledge",
  "music",
  "hi",
  "digital-text",
  "gift-cards",
  "beauty",
  "automotive",
  "mobile-apps",
  "amazon-devices",
  "pet-supplies",
];

const uri = process.env.COSMOSDB_CONNECTION_STRING;
const client = new MongoClient(uri);

let allCategoriesProducts = {};
const updateDB = async () => {
  await client.connect();
  const database = client.db("amazon-scrapper");
  const collection = database.collection("produits");

  await collection.deleteMany({});

  const browser = await puppeteer.launch();

  for (const category of categories) {
    const page = await browser.newPage();
    await page.goto(`https://www.amazon.fr/gp/bestsellers/${category}/`);
    await setTimeout(3000);

    const products = await page.evaluate(() => {
      let items = [];
      const productElements = document.querySelectorAll("[data-asin]");

      for (let element of productElements) {
        if (items.length >= 30) {
          break;
        }
        const rank = element.querySelector(".zg-bdg-text")?.textContent;
        const title = element
          .querySelector(".a-link-normal > span > div")
          ?.textContent.trim();
        const imageUrl = element.querySelector(".a-dynamic-image")?.src;
        const url = element.querySelector(".a-link-normal")?.href;
        const price = element
          .querySelector(".a-link-normal > div > span > span")
          ?.textContent.trim();

        const ratingText = element
          .querySelector(".a-icon-row .a-link-normal")
          ?.getAttribute("title");
        const rating = ratingText ? ratingText.split(" ")[0] : null;
        const votesText = element.querySelector(
          ".a-icon-row .a-size-small"
        )?.textContent;
        const votes = votesText ? votesText.replace(/[^\d]/g, "") : null;

        items.push({
          rank,
          title,
          imageUrl,
          url,
          price,
          rating,
          votes,
        });
      }

      return items;
    });

    allCategoriesProducts[category] = products;

    await collection.insertMany(
      products.map((product) => ({ ...product, category }))
    );

    await page.close();
  }

  await browser.close();
  await client.close();
  console.log("Successfully updated the database with the products");
};
export default updateDB;
