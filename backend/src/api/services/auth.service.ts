import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async createUser(name: string, email: string): Promise<Auth> {
    const user = new Auth();
    user.name = name;
    user.email = email;

    return await this.authRepository.save(user);
  }
}
