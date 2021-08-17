import axios, { AxiosError } from "axios";
import { CrawlerCoordinator } from "./crawlerCoordinator";

export class Crawler {
  private url: string;
  private content?: string;
  private coordinator: CrawlerCoordinator;
  private host?: string;

  public constructor(url: string, coordinator: CrawlerCoordinator) {
    this.url = url;
    this.coordinator = coordinator;
  }

  private async fetch(): Promise<string | null> {
    try {
      const { data, request } = await axios.get(this.url, {
        timeout: 3000,
      });
      this.host = request.host;
      console.log(this.host);
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
    try {
      const anchors = this.content.match(
        /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/gi
      );
      if (!anchors) return;
      anchors.forEach((anchor) => {
        const matched = anchor.match(
          /href=('|")(((http|ftp|https):\/\/)|(\/))*[\w-]+(\.[\w-]+)*([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/gi
        );
        if (!matched) return null;
        let url = matched[0]
          .replace("href=", "")
          .replace(/"/g, "")
          .replace(/'/g, "");

        if (url.startsWith("/")) url = this.host + url;
        this.coordinator.reportUrl(url);
        if (url.indexOf("javascript:") == -1) {
          if (url.indexOf("https://") == -1 || url.indexOf("http://") == -1) {
            console.log("http://" + this.host + url);

            this.coordinator.reportUrl("http://" + this.host + url);
          } else {
            console.log(this.host + url);

            this.coordinator.reportUrl(this.host + url);
          }
        }
      });
    } catch (e) {
      //console.log(this.content);
    }
  }
}
