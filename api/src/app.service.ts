import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Object {
    return {title: "PentaCode", body: "_-_-_-_-_-_"};
  }
}
