import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from 'src/user/model/user.interface'
import { Repository } from 'typeorm';

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
		return this.userRepository.save(newUser);
	}

	async findUser(id: number) {
		const user = await this.userRepository.findOneBy({ id });
		return user;
	}
}
