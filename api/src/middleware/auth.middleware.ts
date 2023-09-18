import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "src/auth/service/auth.service";
import { UserI } from "src/user/model/user.interface";
import { UserService } from "src/user/service/user-service/user.service";

// MIDDLEWARE
@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private authService: AuthService, private userService: UserService) {}

	async use(req: Request, res: Response, next: NextFunction) {

		try {
			if (req.headers['authorization']) {
				const tokenArray: string[] = req.headers['authorization'].split(' ');
				const decodedToken = await this.authService.verifyJwt(tokenArray[1]);
				const user: UserI = await this.userService.getOne(decodedToken.user.id);
				if (user) {
					req.user = user;
					next();
				} else {
					throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
				}
			} else {
				next();
			}
		} catch {
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		}
	}
}