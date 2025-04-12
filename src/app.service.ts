import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): string {
    return 'Visit taskvault.hrustinszkiadam.tech to see the app!';
  }
}
