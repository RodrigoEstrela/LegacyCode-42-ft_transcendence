import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import  UserDto  from './user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
        
    @Get()
    async findAll() {
        return await this.userService.findAll();
    }
    
    @Get(':username')
    async findOne(@Param('username') username: string) {
        const user = await this.userService.findOne(username);
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }
    
    @Put(':username')
    async update(@Param('username') username: string, @Body() updateUserDto: UserDto) {
        const userExists = await this.userService.userExists(username);
        if (!userExists) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return await this.userService.update(username, updateUserDto);
    }
    
    @Delete(':username')
    async remove(@Param('username') username: string) {
        const userExists = await this.userService.userExists(username);
        if (!userExists) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return await this.userService.remove(username);
    }

    // New method to check if a user with the given username exists
    
}


export default UserController;
