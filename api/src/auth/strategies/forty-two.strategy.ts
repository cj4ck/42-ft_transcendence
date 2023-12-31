import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from '../service/auth.service';
import { Profile } from 'passport';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	constructor(
        private readonly authService: AuthService
    ) {
		super({
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.CALLBACK_URL,
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		const user = await this.authService.validateUser(profile.emails[0].value, profile.username);
		return user || null;
	}
}