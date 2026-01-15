import { Injectable } from '@nestjs/common';

@Injectable()
export class TimetableService {
  // TODO: Implement timetable scraping
  async getTimetable(rollno: string, password: string) {
    return {
      message: 'Timetable scraping not implemented yet',
      rollno,
    };
  }
}
