import axios, { AxiosError } from "axios";

export class Crawler {
  private url: string;
  private content?: string;

  public constructor(url: string) {
    this.url = url;
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
      console.log(result);
    } else {
      console.log("Failed to get url data");
    }
  }
}
