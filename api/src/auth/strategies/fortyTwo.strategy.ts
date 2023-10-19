import { ConsoleLogger, Injectable } from '@nestjs/common';
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
		console.log(accessToken);
		console.log(profile);
		console.log(refreshToken);
		const user = this.authService.validateUser(profile.emails[0].value, profile.username);
		console.log('Validate');
		console.log(user);
		return user || null;
	}
}