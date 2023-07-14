import { Controller, Get, Query, Post, Body, Put, Param, Delete, Res, HttpStatus, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/user.dto';

@Controller('auth')
class AuthenticationController {
    constructor(private readonly userService: UserService) {}

  @Post('signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userCreated = await this.userService.createUser(
        createUserDto.name,
        createUserDto.email
      );
    console.log(userCreated);
    return userCreated;
  }
}

export default AuthenticationController;
