import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../services/auth.service';
import { AuthenticationController } from '../controllers';
import { Auth } from '../entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auth])], // Make sure to import the module where AuthService is defined
  providers: [AuthService],
  controllers: [AuthenticationController],
})
export default class AuthModule {}
