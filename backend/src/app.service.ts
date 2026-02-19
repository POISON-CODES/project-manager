import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Returns a simple greeting.
   * 
   * @returns Greeting string.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
