import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface'
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {

	constructor(
		private readonly jwtService: JwtService,
		@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
	) {}

	async generateJwt(user: UserI): Promise<string> {
		return this.jwtService.signAsync({user});
	}

	hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, 12);
	}

	comparePasswords(password: string, storedPasswordHash: string): Promise<any> {
		return bcrypt.compare(password, storedPasswordHash);
	}

	verifyJwt(jwt: string): Promise<any> {
		return this.jwtService.verifyAsync(jwt);
	}

	async validateUser(email: string, username: string) {
		console.log('AuthService');
		console.log(email);
		console.log(username);
		const user = await this.userRepository.findOneBy({ email });
		console.log(user);
		if (user) return user;
		console.log('User not found. Creating...');
		const newUser = this.userRepository.create({ email, username });
		console.log('User created: ');
		console.log(newUser);
		const savedUser = await this.userRepository.save(newUser);
		console.log('User saved: ');
		console.log(savedUser);
		return savedUser;
	}

	async findUser(id: number) {
		const user = await this.userRepository.findOneBy({ id });
		return user;
	}

	async generateTwoFactorSecret(email: string): Promise<{ secret: string, otpauthUrl: string, email: string }> {
		const secret = speakeasy.generateSecret({
			name: `PentaCode Transcendence ${email}`,
		});
		return {
			secret: secret.base32,
			otpauthUrl: secret.otpauth_url,
			email: email,
		};
	}

	async generateQrCode(otpauthUrl: string): Promise<string> {
		return qrcode.toDataURL(otpauthUrl);
	}

	verifyTwoFactorSecret(secret: string, token: string): boolean {
		return speakeasy.totp.verify({
			secret: secret,
			encoding: 'base32',
			token: token,
			window: 3,
		})
	}

	async saveUser(user: UserI): Promise<UserEntity> {
		const savedUser = await this.userRepository.save(user);
		return savedUser;
	}

	async findByEmail(email: string): Promise<UserEntity | undefined> {
		try {
			const user = await this.userRepository.findOneBy({ email });
			return user;
		} catch (error) {
			console.error('Error fetching user by email:', error);
			throw new Error('Could not fetch user data');
		}
	}

	async isTwoFactorEnabled(email: string): Promise<boolean> {
		const user = await this.findByEmail(email);
		return user && user.isTwoFactorEnabled;
	}
	
	async generateJwtRoom(room: RoomI): Promise<string> {
		return this.jwtService.signAsync({room});
	}
}

