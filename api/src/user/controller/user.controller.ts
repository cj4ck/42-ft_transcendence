import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { createUserDto } from '../model/dto/create-user.dto';
import { UserService } from '../service/user-service/user.service';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserI } from '../model/user.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('users')
export class UserController {
  constructor(
	private userService: UserService,
	private userHelperService: UserHelperService) {}

  @Post()
  async create(@Body() createUserDto: createUserDto): Promise<UserI> {
	const userEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto);
	return this.userService.create(userEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
	@Query('page') page: number = 1,
	@Query('limit') limit: number = 10
	): Promise<Pagination<UserI>> {
		limit = limit > 100 ? 100: limit;
		return this.userService.findAll({page, limit, route: 'http://localhost:3000/api/users'})
  }

  @Get('/find-by-username')
  async findAllByUsername(@Query('username') username:string) {
	return this.userService.findAllByUsername(username);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
	const userEntity: UserI = this.userHelperService.loginUserDtoIdentity(loginUserDto);
	const jwt: string = await this.userService.login(userEntity);
	return {
		access_token: jwt,
		token_type: 'JWT',
		expires_in: 100000
	};
  }
}
