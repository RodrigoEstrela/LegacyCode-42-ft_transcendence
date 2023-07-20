import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
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
        return await this.userService.findOne(username);
    }
    
    @Put(':username')
    async update(@Param('username') username: string, @Body() updateUserDto: UserDto) {
        return await this.userService.update(username, updateUserDto);
    }
    
    @Delete(':username')
    async remove(@Param('username') username: string) {
        return await this.userService.remove(username);
    }
}

export default UserController;
