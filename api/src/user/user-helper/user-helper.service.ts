import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { Observable, of } from 'rxjs';
import { UserInterface } from '../model/user.interface';
import { LoginUserDto } from '../model/dto/login-user.dto';

@Injectable()
export class UserHelperService {

	changeCreateUserDtoToEntity(createUserDto: CreateUserDto): Observable<UserInterface>
	{
		return of({
			email: createUserDto.email,
			username: createUserDto.username,
			password: createUserDto.password
		});
	}

	changeLoginUserDtoToEntity(createUserDto: LoginUserDto): Observable<UserInterface>
	{
		return of({
			email: createUserDto.email,
			password: createUserDto.password
		});
	}
}
