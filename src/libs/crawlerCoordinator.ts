import { Crawler } from "./crawler";

export class CrawlerCoordinator {
  private urlQueue: string[];

  public constructor() {
    this.urlQueue = [];
  }

  public reportUrl(url: string): void {
    this.urlQueue.push(url);
  }

  public async start(): Promise<void> {
    while (this.urlQueue) {
      const url = this.urlQueue.shift();
      if (!url) {
        continue;
      }
      const crawler = new Crawler(url, this.reportUrl);
      await crawler.trip();
    }
  }
}
