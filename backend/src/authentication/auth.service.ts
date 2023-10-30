import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '.';
import { UserStats } from '../user';
import {response, Response} from "express";

@Injectable()
export class AuthService {
  constructor(
      @InjectRepository(User)
      private readonly authRepository: Repository<User>,
  ) {}

  async createUser(username: string, email: string, password: string): Promise<User> {
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
    user.chatSocket = "";
    user.groupChats = [];
    user.gameSocket = "";
    return await this.authRepository.save(user);
  }

   async checkUserExists(username: string): Promise<boolean> {
    const user = await this.authRepository.exist({where: [{ username }],});
    return user == true;
  }

  async login(username: string, password: string, email: string): Promise<boolean> {
    const user = await this.authRepository.findOne({where: [{ username }],});
    if (user && user.password == password && user.email == email) {
      console.log("Welcome back!")
      return true;
    }
    return false;
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.authRepository.findOne({
      where: [{ id }],
    });
    if (user) {
      console.log("User found!")
      return user;
    }
    return null;
  }

}

export default AuthService;
