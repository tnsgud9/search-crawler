import axios, { AxiosError } from "axios";

export class Crawler {
  private url: string;
  private content?: string;
  private callback: (url: string) => void;

  public constructor(url: string, reportUrl: (url: string) => void) {
    this.url = url;
    this.callback = reportUrl;
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
    }
    return null;
  }

  public async trip(): Promise<void> {
    const result = await this.fetch();
    if (result) {
      this.content = result;
      await this.parseContent();
    } else {
      console.log("Failed to get url data");
    }
  }
  //전달받은 html에서 필요한 데이터 뽑기
  private async parseContent(): Promise<void> {
    // TODO: parsing & extract url
    // TODO: report url using callback
  }
}
