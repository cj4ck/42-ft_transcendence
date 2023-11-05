import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface'

const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {

	constructor(private readonly jwtService: JwtService) {}

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

	async generateJwtRoom(room: RoomI): Promise<string> {
		return this.jwtService.signAsync({room});
	}
}

