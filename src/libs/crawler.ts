import axios, { AxiosError } from "axios";
import { CrawlerCoordinator } from "./crawlerCoordinator";

export class Crawler {
  private url: string;
  private content?: string;
  private coordinator: CrawlerCoordinator;

  public constructor(url: string, coordinator: CrawlerCoordinator) {
    this.url = url;
    this.coordinator = coordinator;
  }

  private async fetch(): Promise<string | null> {
    try {
      const { data } = await axios.get(this.url, {
        timeout: 3000,
      });
      return data;
    } catch (error) {
      if (error.isAxiosError) {
        const e: AxiosError = error;
        console.error(e.response?.status);
      }
      return null;
    }
  }

  public async trip(): Promise<void> {
    const result = await this.fetch();
    if (result) {
      this.content = result;
      //console.log(result);
      await this.parseContent();
    } else {
      console.log("Failed to get url data");
    }
  }

  private async parseContent(): Promise<void> {
    if (!this.content) {
      console.error("Parse ERROR : Dose not have any context!");
      return;
    }
    const anchors = this.content?.match(
      /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/gi
    );
    if (!anchors) return;
    anchors.forEach((anchor) => {
      const matched = anchor.match(
        /href=('|")(((http|ftp|https):\/\/)|(\/))*[\w-]+(\.[\w-]+)*([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i
      );
      if (!matched) return null;
      const url = matched[0]
        .replace("href=", "")
        .replace(/"/g, "")
        .replace(/'/g, "");
      console.log(matched);

      this.coordinator.reportUrl(url);
    });
    // TODO: parsing & extract url
    // TODO: report url using callback
  }
}
