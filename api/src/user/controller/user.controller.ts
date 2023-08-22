import { Controller } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Observable } from 'rxjs';
import { CreateUserDto } from '../model/dto/create-user.dto';

@Controller('user')
export class UserController {

	constructor(
		private userService: UserService
	){}

	@Post()
	create(@Body() createUserDto: CreateUserDto ): Observable<UserI> {

	}
}
