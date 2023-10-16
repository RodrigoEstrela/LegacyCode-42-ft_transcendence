import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '.';
import { FortyTwoAuthGuard } from '../testGuard.guard';
import {LocalStrategy} from "./local.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, FortyTwoAuthGuard, LocalStrategy],
  controllers: [AuthController],
})

export default class AuthModule {
    constructor(){}
}
