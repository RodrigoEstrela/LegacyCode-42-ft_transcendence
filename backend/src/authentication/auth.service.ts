import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '.';
import { UserStats } from '../user';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async createUser(username: string, email: string, password: string): Promise<Auth> {
    const user = new Auth();
    user.username = username;
    user.email = email;
    user.password = password;
    // Set initial values for stats
    const initialStats: UserStats = {
      "Games Played": 0,
      "Wins": 0,
      "Losses": 0,
      "Score": 0,
      "Rank": "",
      "Achievements": "",
    };
    user.stats = initialStats;
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
