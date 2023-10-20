import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '.';
import { FortyTwoAuthGuard } from '../testGuard.guard';
import { LocalStrategy } from "./local.strategy";
import { SessionSerializer } from "./session.serializer";
import { UserService } from '../user/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [AuthService, FortyTwoAuthGuard, LocalStrategy, SessionSerializer, UserService],
    controllers: [AuthController],
    exports: [SessionSerializer],
})

export default class AuthModule {
    constructor(){}
}
