import { Controller, Get, Query, Post, Body, Put, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
@Controller('AuthenticationController')
class AuthenticationController 
{
  @Post()
  createUser(@Res() res: Response) {
    const user = {};
    res.status(HttpStatus.CREATED).send();
  }
  
}

export default AuthenticationController;