import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable, of, switchMap } from 'rxjs';
import { UserInterface } from '../model/user.interface';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { UserHelperService } from '../user-helper/user-helper.service';

@Controller('user')
export class UserController {

	constructor(
		private userService: UserService,
		private userHelperService: UserHelperService
		) {}


	@Post()
	create(@Body() createUserDto: CreateUserDto): Observable<boolean>
	{
		return this.userHelperService.changeCreateUserDtoToEntity(createUserDto).pipe(
			switchMap((user: UserInterface) => this.userService.create())
		)
	}

	@Get()
	findAll()
	{

	}

	@Post()
	login(@Body() loginuserDto: LoginUserDto): Observable<boolean>
	{
		return of(true);
	}
 
}
