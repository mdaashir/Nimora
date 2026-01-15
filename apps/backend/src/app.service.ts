import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot() {
    return {
      name: 'Nimora API',
      version: '2.0.0',
      description: 'Modern Student Portal for PSG Tech',
      documentation: '/api/docs',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'healthy',
        database: 'healthy',
        cache: 'healthy',
      },
    };
  }
}
