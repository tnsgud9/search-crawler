import axios, { AxiosError } from "axios";
import chardet from "chardet";
import iconv from "iconv-lite";
import { CrawlerCoordinator } from "./crawlerCoordinator";
import { parse } from "node-html-parser";
import { initialize } from "koalanlp/Util";
import { KMR } from "koalanlp/API";
import { Tagger } from "koalanlp/proc";

export class Crawler {
  private url: string;
  private content?: Buffer;
  private coordinator: CrawlerCoordinator;
  private host?: string;
  private encoding?: string;

  public constructor(url: string, coordinator: CrawlerCoordinator) {
    this.url = url;
    this.coordinator = coordinator;
  }

  private async fetch(): Promise<Buffer | null> {
    try {
      const { data, request } = await axios.get(this.url, {
        timeout: 3000,
        responseType: "arraybuffer",
      });
      this.host = request.host;
      const detectEndcoding = this.detectEncoding(data);
      if (!detectEndcoding) {
        return null;
      }
      this.encoding = detectEndcoding;
      return data;
    } catch (error) {
      if (error.isAxiosError) {
        const e: AxiosError = error;
        console.error(e.response?.status);
      }
      return null;
    }
  }

  private detectEncoding(data: Buffer): string | null {
    return chardet.detect(data);
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
    try {
      if (!this.content || !this.encoding) {
        console.error("Parse ERROR : Dose not have any context!");
        return;
      }

      const encodedContent = iconv.decode(this.content, this.encoding);
      const html = parse(encodedContent);
      const anchors = html.querySelectorAll("a");
      const scripts = html.querySelectorAll("script");

      scripts.forEach((script) => {
        script.remove();
      });
      //console.log(scripts);

      anchors.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href) return;
        const matched = href.match(
          /^(((http|ftp|https):\/\/)|(\/))*[\w-]+(\.[\w-]+)*([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i
        );
        if (!matched) return null;

        let url = matched[0];

        if (url.startsWith("")) {
          url = this.host + url;
        } else if (!href.startsWith("http")) {
          url = this.host + "/" + url;
        }
        //this.coordinator.reportUrl(url);
      });
      html.querySelectorAll("script").forEach((script) => script.remove());

      const text = html.text.replace(/\s{2, }/g, " ");
      await this.parseKeywords(text);
    } catch (e) {
      console.log(e);
    }
  }

  private async parseKeywords(text: string) {
    await initialize({
      packages: { KMR: "2.0.4", KKMA: "2.0.4" },
      verbose: true,
    });

    const tagger = new Tagger(KMR);
    const tagged = await tagger(text);
    for (const sent of tagged) {
      for (const word of sent._items) {
        for (const morpheme of word._items) {
          if (morpheme._tag === "NNG") console.log(morpheme.toString());
        }
      }
    }
  }
}
