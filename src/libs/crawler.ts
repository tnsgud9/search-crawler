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
  private content?: string;
  private coordinator: CrawlerCoordinator;
  private host?: string;
  //private encoding?: string;

  public constructor(url: string, coordinator: CrawlerCoordinator) {
    this.url = url;
    this.coordinator = coordinator;
  }

  private async fetch(): Promise<string | null> {
    const browser = await this.coordinator.getBrowser().getInstance();
    if (!browser) return null;
    const page = await browser.newPage();
    await page.goto(this.url);
    const result = await page.content();

    if (result) {
      this.content = result;
      return this.content;
    }
    return null;
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
      if (!this.content) {
        console.error("Parse ERROR : Dose not have any context!");
        return;
      }

      const html = parse(this.content).querySelector("body");
      const anchors = html.querySelectorAll("a");

      anchors.forEach((anchor) => {
        const href = anchor.getAttribute("href");
        if (!href) return;
        const matched = href.match(
          /^(((http|ftp|https):\/\/)|(\/))*[\w-]+(\.[\w-]+)*([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/i
        );
        if (!matched) return null;

        let url = matched[0];

        if (url.startsWith("/")) {
          url = this.host + url;
        } else if (!href.startsWith("http")) {
          url = this.host + "/" + url;
        }

        //주석풀면 크롤링 계속 진행됨
        //this.coordinator.reportUrl(url);
      });
      html.querySelectorAll("script").forEach((script) => script.remove());

      const text = html.text.replace(/\s{2,}/g, " ");
      await this.parseKeywords(text);
    } catch (e) {
      console.log(e);
    }
  }

  private async parseKeywords(text: string) {
    const tagger = new Tagger(KMR);
    const tagged = await tagger(text);
    for (const sent of tagged) {
      for (const word of sent._items) {
        for (const morpheme of word._items) {
          if (
            morpheme._tag === "NNG" ||
            morpheme._tag === "NNP" ||
            morpheme._tag === "NNB" ||
            morpheme._tag === "NP" ||
            morpheme._tag === "NR" ||
            morpheme._tag === "VV" ||
            morpheme._tag === "SL"
          )
            console.log(morpheme.toString());
        }
      }
    }
  }
}
