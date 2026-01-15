import { Injectable } from "@nestjs/common";

@Injectable()
export class InternalsService {
  async getInternals(rollno: string, _password: string) {
    return {
      message: "Internals scraping not implemented yet",
      rollno,
    };
  }
}
