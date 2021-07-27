import { CrawlerCoordinator } from "./libs/crawlerCoordinator";

(async () => {
  const coordinator = new CrawlerCoordinator();
  coordinator.reportUrl("https://naver.com");
  await coordinator.start();
})();
