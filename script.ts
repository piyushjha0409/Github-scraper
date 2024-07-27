import puppeteer from "puppeteer";
import { RepoData } from "./types";
import * as fs from "fs";

const getScrapedDataFromGithub = async (
  searchUrl: string
): Promise<RepoData[]> => {
  try {
    let browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    let page = await browser.newPage();

    await page.goto(searchUrl, {
      waitUntil: "networkidle0",
    });

    const results: RepoData[] = await page.evaluate(() => {
      const repoList = document.querySelectorAll(
        ".Box-sc-g0xbh4-0 .kXssRI > div"
      );

      return Array.from(repoList).map((repo): RepoData => {
        const titleElement = repo.querySelector(
          "div > div.Box-sc-g0xbh4-0.jUbAHB > h3 > div"
        );
        const descriptionElement = repo.querySelector(
          "div > div.Box-sc-g0xbh4-0.jUbAHB > div.Box-sc-g0xbh4-0.LjnbQ"
        );
        const labelElements = repo.querySelector(
          "div > div.Box-sc-g0xbh4-0.jUbAHB > div.Box-sc-g0xbh4-0.frRVAS"
        );
        const starsElement = repo.querySelector(
          "div > div.Box-sc-g0xbh4-0.jUbAHB > ul > li:nth-child(3) > a"
        );
        const languageElement = repo.querySelector(
          "div > div.Box-sc-g0xbh4-0.jUbAHB > ul > li:nth-child(1) > span"
        );
        const updatedElement = repo.querySelector(
          "div > div.Box-sc-g0xbh4-0.jUbAHB > ul > li:nth-child(5) > span"
        );

        return {
          title: titleElement?.textContent?.trim() || "",
          url: (titleElement as HTMLAnchorElement)?.href || "",
          description: descriptionElement?.textContent?.trim() || "",
          label: labelElements?.textContent || "",
          stars: starsElement?.textContent?.trim() || "",
          language: languageElement?.textContent?.trim() || "",
          lastUpdated: updatedElement?.textContent?.trim() || "",
        };
      });
    });
    console.log(results);
    return results;
  } catch (error) {
    console.log(error);
    return [];
  } finally {
    const browser = await puppeteer.launch();
    if (browser) await browser.close();
  }
};

//function for writing a file
const writeFileToSync = (results: RepoData[], filename: string) => {
    try{
     fs.writeFileSync(filename, JSON.stringify(results, null, 2))
     console.log(`File written as ${filename}`)
    }catch(err){
        console.error(err);
    }
}



const main = async () => {
    const url = "https://github.com/search?q=language%3ATypeScript+language%3AJavaScript+label%3A%22help+wanted%22+stars%3A100%3C200&type=&p=2"
    let result = await getScrapedDataFromGithub(url);
    console.log("Results->", result)
    writeFileToSync(result, "github_data.json")
}

main();



