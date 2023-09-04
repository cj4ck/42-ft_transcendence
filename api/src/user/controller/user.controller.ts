import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { createUserDto } from '../model/dto/create-user.dto';
import { Observable, of, switchMap } from 'rxjs';
import { UserService } from '../service/user-service/user.service';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserI } from '../model/user.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(
	private userService: UserService,
	private userHelperService: UserHelperService) {}

  @Post()
  create(@Body() createUserDto: createUserDto): Observable<UserI> {
	return this.userHelperService.createUserDtoToEntity(createUserDto).pipe(
		switchMap((user: UserI) => this.userService.create(user))
	)
  }

  @Get()
  findAll(
	@Query('page') page: number = 1,
	@Query('limit') limit: number = 10
	): Observable<Pagination<UserI>> {
		limit = limit > 100 ? 100: limit;
		return this.userService.findAll({page, limit, route: 'http://localhost:300/api/users'})

  }

  @Post('login')
  login(@Body() LoginUserDto: LoginUserDto): Observable<boolean> {
	return this.userHelperService.loginUserDtoIdentity(LoginUserDto).pipe(
		switchMap((user: UserI) => this.userService.login(user))
	)
  }
}
