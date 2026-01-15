import { Injectable } from "@nestjs/common";

@Injectable()
export class TimetableService {
  async getTimetable(rollno: string, _password: string) {
    return {
      message: "Timetable scraping not implemented yet",
      rollno,
    };
  }
}
