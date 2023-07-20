import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User }  from '.';

@Module({
    imports: [TypeOrmModule.forFeature([User])], // Make sure to import the module where AuthService is defined
    providers: [UserService],
    controllers: [UserController],
})

export default class UserModule {}