import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginResponseI } from 'src/user/model/login-response.interface';
import { UserI } from 'src/user/model/user.interface';
import { FortyTwoAuthGuard } from '../guards/forty-two.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('42/login')
  @UseGuards(FortyTwoAuthGuard)
  handleLogin() { }

  @Get('42/redirect')
  @UseGuards(FortyTwoAuthGuard)
  async handleRedirect(@Req() req, @Res() res: Response) {
    const user = req.user;
    const frontendURL = process.env.FRONTEND_URL;
    if (user.isTwoFactorEnabled) {
      res.redirect(`${frontendURL}/2fa-verify`);
    } else {
      const jwtToken = await this.authService.generateJwt(user);
      res.redirect(`${frontendURL}?token=${jwtToken}`);
      // user.activityStatus = 'online'
      // this.authService.saveUser(user)
    }
  }

  @Post('42/2fa/verify')
  async verifyTwoFactor42(@Req() req, @Body() body: { token: string }): Promise<LoginResponseI> {
    const { token } = body;
    const user = await this.authService.findByEmail(req.user.email);
    const isVerified = this.authService.verifyTwoFactorSecret(user.twoFactorSecret, token);
    const jwt = await this.authService.generateJwt(user);
    if (isVerified) {
      // user.activityStatus = 'online'
      // this.authService.saveUser(user)
      return {
        access_token: jwt,
        token_type: 'JWT',
        expires_in: 10000,
        status: true,
      }
    }
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

  @Get('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generateTwoFactor(@Req() req): Promise<{ qrCodeUrl: string }> {
    const { otpauthUrl, secret } = await this.authService.generateTwoFactorSecret(req.user.email);
    const qrCodeUrl = await this.authService.generateQrCode(otpauthUrl);
    req.user.temp2faSecret = secret;
    await this.authService.saveUser(req.user);
    return { qrCodeUrl };
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  async verifyTwoFactor(@Req() req, @Body() body: { token: string }): Promise<{ success: boolean }> {
    const { token } = body;
    const user = await this.authService.findByEmail(req.user.email);
    const secret = user.temp2faSecret;
    const isVerified = this.authService.verifyTwoFactorSecret(secret, token);

    if (isVerified) {
      user.twoFactorSecret = secret;
      user.isTwoFactorEnabled = true;
      user.temp2faSecret = null;
      await this.authService.saveUser(user);
    }
    return { success: isVerified };
  }

  @Get('2fa/enabled')
  @UseGuards(JwtAuthGuard)
  async isTwoFactorEnabled(@Req() req): Promise<{ isEnabled: boolean }> {
    const isEnabled = await this.authService.isTwoFactorEnabled(req.user.email);
    return { isEnabled };
  }

  // @Get('logout')
  // async logout(@Req() req) {
  //   const user: UserI = req.user
  //   await this.authService.logout(user);
  // }
}

