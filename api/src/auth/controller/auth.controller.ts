import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { FortyTwoAuthGuard } from '../guards/forty-two.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

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
    console.log(secret);
    const isVerified = this.authService.verifyTwoFactorSecret(secret, token);

    if (isVerified) {
      user.twoFactorSecret = secret;
      user.isTwoFactorEnabled = true;
      user.temp2faSecret = null;
      await this.authService.saveUser(user);
    }
    return { success: isVerified };
  }
}

