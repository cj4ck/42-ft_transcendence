import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../model/user.entity';
import { Repository } from 'typeorm';
import { UserInterface } from '../model/user.interface';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>
	) {}

	create(newUser: UserInterface) : Observable<UserInterface> {

	}

	private mailExist
}
