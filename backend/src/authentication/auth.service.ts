import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import { User } from '.';
import { UserStats } from '../user';
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly authRepository: Repository<User>,
  ) {}

  async createUser(username: string, email: string, password: string): Promise<User> {
    // const entityManager = getManager();
    // const maxIdUser = await entityManager.query('SELECT MAX(id) FROM user');
    // const newId = maxIdUser[0].max + 1;
    // Set initial values for stats
    const initialStats: UserStats = {
      "Games Played": 0,
      "Wins": 0,
      "Losses": 0,
      "Score": 0,
      "Rank": "",
      "Achievements": "",
    };
    
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password;
    user.avatar = "";
    user.friends = [];
    user.friendRequestsReceived = [];
    user.friendRequestsSent = [];
    user.blockedUsers = [];
    user.stats = initialStats;
    user.history = [];
    user.status = "online";
    return await this.authRepository.save(user);
  }

  async checkUserExists(username: string, email: string): Promise<boolean> {
    const user = await this.authRepository.findOne({
      where: [{ username }, { email }],
    });
    return !!user;
  }

  getHello(request: Request): string {
    console.log("d3efewfwe");
    return 'WTF ' + request;
  }

}

export default AuthService;
