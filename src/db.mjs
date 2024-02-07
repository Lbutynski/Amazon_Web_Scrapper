import puppeteer from "puppeteer";
import fs from "fs";
import { setTimeout } from "timers/promises";

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

const jsonFilePath = "top_products_by_category.json";
let allCategoriesProducts = {};

(async () => {
  const browser = await puppeteer.launch();

  for (const category of categories) {
    const page = await browser.newPage();
    await page.goto(`https://www.amazon.fr/gp/bestsellers/${category}/`);
    await setTimeout(3000);

    const products = await page.evaluate(() => {
      let items = [];
      const productElements = document.querySelectorAll("[data-asin]");

      for (let element of productElements) {
        if (items.length >= 10) {
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

        // Récupération du nombre d'étoiles et du nombre de votes
        const ratingText = element
          .querySelector(".a-icon-row .a-link-normal")
          ?.getAttribute("title"); // Par exemple, "4,3 sur 5 étoiles"
        const rating = ratingText ? ratingText.split(" ")[0] : null; // Prend le premier élément du texte divisé, soit "4,3"
        const votesText = element.querySelector(
          ".a-icon-row .a-size-small"
        )?.textContent; // Par exemple, "5 196"
        const votes = votesText ? votesText.replace(/[^\d]/g, "") : null; // Supprime tous les caractères non numériques, soit "5196"

        items.push({
          rank,
          title,
          imageUrl,
          url,
          price,
          rating, // Ajout du nombre d'étoiles
          votes, // Ajout du nombre de votes
        });
      }

      return items;
    });

    allCategoriesProducts[category] = products;
    fs.writeFileSync(
      jsonFilePath,
      JSON.stringify(allCategoriesProducts, null, 2)
    );
    await page.close();
  }

  await browser.close();
  console.log("Successfully updated JSON file in real-time");
})();
