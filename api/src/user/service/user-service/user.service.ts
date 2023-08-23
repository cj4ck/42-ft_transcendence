import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { UserI } from '../../model/user.interface';

import { Repository } from 'typeorm';
import { map, switchMap } from 'rxjs/operators'

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
						switchMap((password: string) => {
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

	private hashPassword(password: string): Observable<string> {
		return from<string>(bcrypt.hash(password, 12));
	}

	private findOne(id: number): Observable<UserI> {
		return from(this.userRepository.findOne({ id }));
	}

	private mailExists(email: string): Observable<boolean> {
		return from(this.userRepository.findOne({ email })).pipe(
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
