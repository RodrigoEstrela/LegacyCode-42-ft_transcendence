import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/auth.dto';

@Controller('auth')
class AuthenticationController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() createAuthDto: CreateAuthDto) {
    const { name, email } = createAuthDto;

    // Check if a user with the same name or email already exists
    const userExists = await this.authService.checkUserExists(name, email);
    if (userExists) {
      throw new HttpException(
        'User with the same name or email already exists',
        HttpStatus.CONFLICT,
      );
    }

    // If no user with the same name or email exists, create the user
    console.log('Received create user request');
    const userCreated = await this.authService.createUser(name, email);
    console.log(userCreated);
    return userCreated;
  }
}

export default AuthenticationController;
