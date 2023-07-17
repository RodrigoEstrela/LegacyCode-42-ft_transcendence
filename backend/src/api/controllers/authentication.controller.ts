import { Controller, Get, Query, Post, Body, Put, Param, Delete, Res, HttpStatus, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { CreateAuthDto } from '../dto/auth.dto';

@Controller('auth')
class AuthenticationController {
    constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() createAuthDto: CreateAuthDto) {
    console.log('Received create user request');
    const userCreated = await this.authService.createUser(
        createAuthDto.name,
        createAuthDto.email
      );
    console.log(userCreated);
    return userCreated;
  }
}

export default AuthenticationController;
