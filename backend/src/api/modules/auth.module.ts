import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthenticationController } from '../controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../repositories/user.repository';

@Module({
  imports: [UserRepository], // Make sure to import the module where UserService is defined
  providers: [UserService],
  controllers: [AuthenticationController],
})
export default class AuthModule {}
