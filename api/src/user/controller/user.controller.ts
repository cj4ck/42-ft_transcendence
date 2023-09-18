import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { createUserDto } from '../model/dto/create-user.dto';
import { Observable, map, of, switchMap } from 'rxjs';
import { UserService } from '../service/user-service/user.service';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserI } from '../model/user.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

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

  // this endpoint has a guard now, so it can only be requested by sm1 with jwt
  // MIDDLEWARE removes this line:
//   @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
	@Query('page') page: number = 1,
	@Query('limit') limit: number = 10
	): Observable<Pagination<UserI>> {
		limit = limit > 100 ? 100: limit;
		return this.userService.findAll({page, limit, route: 'http://localhost:3000/api/user'})

  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto): Observable<LoginResponseI> {
	return this.userHelperService.loginUserDtoIdentity(loginUserDto).pipe(
		switchMap((user: UserI) => this.userService.login(user).pipe(
			map((jwt:string) => {
				return {
					access_token: jwt,
					token_type: 'JWT',
					expires_in: 100000
				}
			})
		))
	)
  }
}
