import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth } from '.';

@Module({
  imports: [TypeOrmModule.forFeature([Auth])], // Make sure to import the module where AuthService is defined
  providers: [AuthService],
  controllers: [AuthController],
})

export default class AuthModule {}
