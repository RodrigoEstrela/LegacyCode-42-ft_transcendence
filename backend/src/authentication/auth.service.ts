import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '.';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async createUser(username: string, email: string, password: string, /*RETIRAR ESTE TAMBEM*/friends: string[]): Promise<Auth> {
    const user = new Auth();
    user.username = username;
    user.email = email;
    user.password = password;
  // RETIRAR DEPOIS DE TER O MODULO DE USERS PRONTO
    user.friends = friends;
  // ----------------------------------------------
    return await this.authRepository.save(user);
  }

  async checkUserExists(username: string, email: string): Promise<boolean> {
    const user = await this.authRepository.findOne({
      where: [{ username }, { email }],
    });
    return !!user;
  }
}

export default AuthService;
