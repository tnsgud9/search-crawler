import { Crawler } from "./lib/crawler";

(async () => {
  const crawler = new Crawler("https://www.naver.com");
  await crawler.trip();
})();
