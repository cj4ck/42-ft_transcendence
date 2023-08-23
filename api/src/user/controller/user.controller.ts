import { Body, Controller, Post, Get } from '@nestjs/common';
import { UserService } from '../service/user-service/user.service';
import { Observable, of, switchMap } from 'rxjs';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { UserI } from '../model/user.interface';
import { UserHelperService } from '../service/user-helper/user-helper.service';

@Controller('user')
export class UserController {

	constructor(
		private userService: UserService,
		private userHelperService: UserHelperService
	){}

	@Post()
	create(@Body() createUserDto: CreateUserDto ): Observable<UserI> {
		return this.userHelperService.createUserDtoToEntity(createUserDto).pipe(
			switchMap((user: UserI) => this.userService.create(user))
		)
	}

	@Get()
	findAll() {

	}

	@Post()
	login() {

	}
}
