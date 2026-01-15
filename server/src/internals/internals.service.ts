import { Injectable } from "@nestjs/common";

@Injectable()
export class InternalsService {
  // TODO: Implement internals scraping
  async getInternals(rollno: string, _password: string) {
    return {
      message: "Internals scraping not implemented yet",
      rollno,
    };
  }
}
