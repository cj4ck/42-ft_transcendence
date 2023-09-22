import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { createUserDto } from 'src/user/model/dto/create-user.dto';
import { LoginUserDto } from 'src/user/model/dto/login-user.dto';
import { UserI } from 'src/user/model/user.interface';

@Injectable()
export class UserHelperService {
	
	createUserDtoToEntity(createUserDto: createUserDto) : UserI {
		return {
			email: createUserDto.email,
			username: createUserDto.username,
			password: createUserDto.password,
		};
	}

	loginUserDtoIdentity(loginUserDto: LoginUserDto) : UserI {
		return {
			email: loginUserDto.email,
			password: loginUserDto.password
		};
	}
}
