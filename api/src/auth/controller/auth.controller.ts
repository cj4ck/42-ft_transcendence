import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LoginResponseI } from 'src/user/model/login-response.interface';
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
    }
  }

  @Post('42/2fa/verify')
  async verifyTwoFactor42(@Req() req, @Body() body: { token: string, email: string }): Promise<LoginResponseI> {
    const { token, email } = body;
    const user = await this.authService.findByEmail(email);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isVerified = this.authService.verifyTwoFactorSecret(user.twoFactorSecret, token);

    if (isVerified) {
      const jwt = await this.authService.generateJwt(user);
      return {
        access_token: jwt,
        token_type: 'JWT',
        expires_in: 10000,
        status: true,
      };
    } else {
      throw new HttpException('Invalid 2FA token', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async generateTwoFactor(@Req() req): Promise<{ qrCodeUrl: string }> {
    const { otpauthUrl, secret } = await this.authService.generateTwoFactorSecret(req.user.email);
    const qrCodeUrl = await this.authService.generateQrCode(otpauthUrl);
    const user = await this.authService.findByEmail(req.user.email);
    user.temp2faSecret = secret;
    await this.authService.saveUser(user);
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

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disableTwoFactor(@Req() req, @Body() body: { token: string }): Promise<{ success: boolean }> {
    const { token } = body;
    const user = await this.authService.findByEmail(req.user.email);
    const secret = user.twoFactorSecret;
    const isVerified = this.authService.verifyTwoFactorSecret(secret, token);

    if (isVerified) {
      user.twoFactorSecret = null;
      user.isTwoFactorEnabled = false;
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
}

