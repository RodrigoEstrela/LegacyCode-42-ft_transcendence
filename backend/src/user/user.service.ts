import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '.';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(username: string, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      Object.assign(user, updateUserDto);
      return this.userRepository.save(user);
    }
    return null;
  }

  async remove(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user) {
      await this.userRepository.remove(user);
      return user;
    }
    return null;
  }

  async userExists(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { username } });
    return !!user;
  }
  
}

export default UserService;
