
import { IsEmail, IsNotEmpty, IsStrongPassword, isValidationOptions } from 'class-validator'

export class LoginUserDto
{
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsStrongPassword()
	password: string;
}