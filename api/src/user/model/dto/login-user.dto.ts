import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginUserDto {

	@IsEmail()
	email: string;

	@IsNotEmpty()
	password: string;

	@IsString()
	@IsOptional()
	twoFactorAuthCode?: string;
}