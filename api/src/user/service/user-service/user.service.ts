import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from '../../model/user.interface';

import { Repository } from 'typeorm';
import { map, mapTo, switchMap } from 'rxjs/operators'
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>
	) {}

	create(newUser: UserI): Observable<UserI> {
		return this.mailExists(newUser.email).pipe(
			switchMap((exists: boolean) => {
				if(!exists) {
					return this.hashPassword(newUser.password).pipe(
						switchMap((passwordHash: string) => {
							// overwrite the user password with the hash, to store the hash in the database
							newUser.password = passwordHash;
							return from(this.userRepository.save(newUser)).pipe(
								switchMap((user: UserI) => this.findOne(user.id))
							);
						})
					)
				} else {
					throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
				}
			})
		)
	}

	// change to JWT in next video
	login(user: UserI): Observable<boolean> {
		return this.findByEmail(user.email).pipe(
			switchMap((foundUser: UserI) => {
				if (foundUser) {
					return this.validatePassword(user.password, foundUser.password).pipe(
						switchMap((matches: boolean) => {
							if (matches) {
								return this.findOne(foundUser.id).pipe(mapTo(true))
							} else {
								throw new HttpException('Login was not succesful, wrong credentials', HttpStatus.UNAUTHORIZED);
							}
						})
					)
				} else {
					throw new HttpException('User not found', HttpStatus.NOT_FOUND);
				}
			})
		)
	}

	findAll(options: IPaginationOptions): Observable<Pagination<UserI>> {
		return from(paginate<UserEntity>(this.userRepository, options));
	}

	private validatePassword(password: string, storedPasswordHash: string): Observable<any> {
		return from(bcrypt.compare(password, storedPasswordHash));
	}

	// also returns password
	private findByEmail(email: string): Observable<UserI> {
		return from(
			this.userRepository.findOne({
				where: { email }, 
				select: ['id', 'email', 'username', 'password']
			})
		);
	}

	private hashPassword(password: string): Observable<string> {
		return from<string>(bcrypt.hash(password, 12));
	}

	private findOne(id: number): Observable<UserI> {
		return from(this.userRepository.findOne({ where: { id } }));
	}

	private mailExists(email: string): Observable<boolean> {
		return from(this.userRepository.findOne({ where: { email } })).pipe(
			map((user: UserI) => {
				if(user) {
					return true;
				} else {
					return false;
				}
			})
		)
	}
 }
