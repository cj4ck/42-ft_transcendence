import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { FortyTwoAuthGuard } from '../guards/fortyTwo.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Get('42/login')
  @UseGuards(FortyTwoAuthGuard)
  handleLogin() {}

  @Get('42/redirect')
  @UseGuards(FortyTwoAuthGuard)
  async handleRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const jwtToken = await this.authService.generateJwt(user);
    const frontendURL = process.env.FRONTEND_URL;
    res.redirect(`${frontendURL}?token=${jwtToken}`);
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

