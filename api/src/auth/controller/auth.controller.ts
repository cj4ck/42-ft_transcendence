import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FortyTwoAuthGuard } from '../guards/fortyTwo.guard';

@Controller('auth')
export class AuthController {


  @Get('42/login')
  @UseGuards(FortyTwoAuthGuard)
  handleLogin() {
    return { msg: '42 Authentication'}
  }

  @Get('42/redirect')
  @UseGuards(FortyTwoAuthGuard)
  handleRedirect() {
    return { msg: 'OK' };
  }

  @Get('status')
  user(@Req() request: Request) {
    console.log(request.user);
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }
}
