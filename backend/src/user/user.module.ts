import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
// import { User }  from '.';
import { default as User } from "../entities/user.entity";


@Module({
    imports: [TypeOrmModule.forFeature([User])], // Make sure to import the module where AuthService is defined
    providers: [UserService],
    controllers: [UserController],
})

export default class UserModule {}