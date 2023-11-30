import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from '../../model/user.interface';

import { Like, Repository } from 'typeorm';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';
import { Observable } from 'rxjs';


@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private authService: AuthService
	) {}

	async create(newUser: UserI): Promise<UserI> {
		try {
			const exists: boolean = await this.mailExists(newUser.email)
			if(!exists) {
				const passwordHash: string = await this.hashPassword(newUser.password)
				newUser.password = passwordHash
				const user = await this.userRepository.save(this.userRepository.create(newUser))
				return this.findOne(user.id)
			} else {
				throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
			}
		} catch {
			throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
		}
	}

	async login(user: UserI): Promise<{ jwt?: string; isTwoFactorRequired?: boolean }> {
		try {
			const foundUser: UserI = await this.findByEmail(user.email.toLowerCase());
			if (!foundUser) {
				throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
			}
			const passwordIsValid: boolean = await this.validatePassword(user.password, foundUser.password);
			if (!passwordIsValid) {
				throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
			}
			const payload: UserI = await this.authService.findByEmail(foundUser.email);
			if (payload.isTwoFactorEnabled) {
				return { isTwoFactorRequired: true };
			}
			const jwt = await this.authService.generateJwt(payload);
				return { jwt };
		} catch (error) {
		console.error('Login error:', error);
		throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async verifyTwoFactorAuthentication(email: string, twoFactorAuthCode: string): Promise<{ jwt: string }> {
		const user: UserI = await this.authService.findByEmail(email);
		if (!user || !user.isTwoFactorEnabled) {
			throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
		}
		const is2faCodeValid = this.authService.verifyTwoFactorSecret(user.twoFactorSecret, twoFactorAuthCode);
		if (!is2faCodeValid) {
			throw new HttpException('Invalid two-factor authentication code', HttpStatus.FORBIDDEN);
		}
		const jwt = await this.authService.generateJwt(user);
		return { jwt };
	}

	async findAll(options: IPaginationOptions): Promise<Pagination<UserI>> {
		return paginate<UserEntity>(this.userRepository, options);
	}

	async findAllByUsername(username: string): Promise<UserI[]> {
		return this.userRepository.findBy({
			username: Like(`%${username.toLowerCase()}%`)
		})
	}

	async findById(id: number): Promise<UserI> {
		return this.userRepository.findOne({
			where : {
				id
			}
		})
	}
	async findOneByUsername(username: string): Promise<UserI> {
		// console.log('findonebyusername ' + username)
		return this.userRepository.findOne({
			where: {
				username: Like(`%${username.toLowerCase()}%`)
			}
		})
	}

	async doesUsernameExist(username: string) {
			const user = await this.userRepository.findOne({
			  where: {
				username: Like(`%${username.toLowerCase()}%`),
			  },
			});
			if (user === null)
				return (false)
			else
				return (true)
	}

	async updateBlockedIds(user: UserI): Promise<UserI> {
		console.log('update Blocked Ids')
		// Assuming you have a method to retrieve the room from the database
		const existingUser = await this.getOne(user.id);
		if (!existingUser) {
			console.log('user not found')
		}
		existingUser.blocked = user.blocked
		// Save the updated room to the database
		return this.userRepository.save(existingUser);
	}

	async getBlockedUsers(user_id: number): Promise<number[]> {
		// console.log('get blocked users ' + user_id)
		const foundUser = await this.userRepository.findOne({ where: { id: user_id } })
		return foundUser.blocked
		// .then(user => {
		//   if (user) {
		// 	console.log('User found, returning ' + user.blocked);
		// 	return(user.blocked);
		//   } else {
		// 	console.log('User not found');
		// 	return []
		//   }
		// })
		// .catch(error => {
		// 	console.log(error)
		// 	return []
		// });
		// return []
	}

	// also returns password
	private async findByEmail(email: string): Promise<UserI> {
		return this.userRepository.findOne({where: { email }, select: ['id', 'email', 'username', 'password']});
	}

	private async hashPassword(password: string): Promise<string> {
		return this.authService.hashPassword(password);
	}

	private async validatePassword(password: string, storedPasswordHash: string): Promise<any> {
		return this.authService.comparePasswords(password, storedPasswordHash);
	}

	async findOne(id: number): Promise<UserI> {
		return this.userRepository.findOne({ where: { id } });
	}

	public getOne(id: number): Promise<UserI> {
		return this.userRepository.findOneOrFail({ where : { id }});
	}

	private async mailExists(email: string): Promise<boolean> {
		const user = await this.userRepository.findOne({where : { email }});
			if(user) {
				return true
			} else {
				return false
			}
	}

	public async savePlayer(user: UserI)
	{
		await this.userRepository.save(user);
	}

	async changeUsername(user: UserI): Promise<UserI> {
		const existingUser = await this.getOne(user.id)
		existingUser.username = user.username
		return this.userRepository.save(existingUser);
	}
 }
