import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if the new username is provided in the updateUserDto
    if (updateUserDto.username) {
      const newUser = await this.userRepository.findOne({ where: { username: updateUserDto.username } });
      // Check if the new username already exists and is different from the current username
      if (newUser && newUser.username !== username) {
        throw new HttpException('User with the new username already exists', HttpStatus.CONFLICT);
      }
    }

    // Update the user with the provided data
    Object.assign(existingUser, updateUserDto);
    return this.userRepository.save(existingUser);
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
