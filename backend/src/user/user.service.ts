import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { User } from '.';
import { default as User } from "../entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // GET ALL USERS ------------------------------------------------------------------------------------------
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  // GET ONE USER -------------------------------------------------------------------------------------------
  async findOne(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  // UPDATE USER --------------------------------------------------------------------------------------------
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
  // UPDATE USER STATS --------------------------------------------------------------------------------------
  async manageStatsAndUsers(username: string, command: string, value: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (!existingUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // TODO: ACEITAR JSON COM A INFO DO JOGO PARA ADICIONAR A GAME HISTORY
    // Update the user with the provided data
    switch (command) {
      case 'game':
        existingUser.stats["Games Played"] += 1;
        if (value === 'win') {
          existingUser.stats["Wins"] += 1;
          existingUser.stats["Score"] += 10;
          // TODO: ADICIONAR SISTEMA DE RANKING
        }
        else if (value === 'loss') {
          existingUser.stats["Losses"] += 1;
          if (existingUser.stats["Score"] > 0) {
            existingUser.stats["Score"] -= 5;
          }
          // TODO: ADICIONAR SISTEMA DE RANKING
        }
        break;
      case 'blockuser':
        if (username == value)
        {
          throw new HttpException("That's you!", HttpStatus.CONFLICT);
        }
        const targetUser5 = await this.userRepository.findOne({ where: { username: value } });
        if (!targetUser5) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (existingUser.blockedUsers.includes(value)) {
          throw new HttpException('User is already blocked', HttpStatus.CONFLICT);
        }
        existingUser.blockedUsers.push(value);
        this.userRepository.save(targetUser5);
        break;
      case 'addfriend':
        if (username == value)
        {
          throw new HttpException("That's you!", HttpStatus.CONFLICT);
        }
        const targetUser = await this.userRepository.findOne({ where: { username: value } });
        if (!targetUser) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (existingUser.friends.includes(value)) {
          throw new HttpException('User is already your friend', HttpStatus.CONFLICT);
        }
        if (existingUser.friendRequestsSent.includes(value)) {
          throw new HttpException('Friend request already sent', HttpStatus.CONFLICT);
        }
        if (targetUser.blockedUsers.includes(username)) {
          throw new HttpException('User has blocked you', HttpStatus.CONFLICT);
        }
        if (existingUser.blockedUsers.includes(value)) {
          throw new HttpException('You have blocked this user', HttpStatus.CONFLICT);
        }
        targetUser.friendRequestsReceived.push(username);
        existingUser.friendRequestsSent.push(value);
        this.userRepository.save(targetUser);
        break;
      case 'acceptfriend':
        if (username == value)
        {
          throw new HttpException("That's you!", HttpStatus.CONFLICT);
        }
        const targetUser2 = await this.userRepository.findOne({ where: { username: value } });
        if (!targetUser2) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (!existingUser.friendRequestsReceived.includes(value)) {
          throw new HttpException('No friend request received from this user', HttpStatus.CONFLICT);
        }
        if (existingUser.friends.includes(value)) {
          throw new HttpException('User is already your friend', HttpStatus.CONFLICT);
        }
        if (targetUser2.blockedUsers.includes(username)) {
          targetUser2.friendRequestsSent = targetUser2.friendRequestsSent.filter((user: string) => user !== username);
          existingUser.friendRequestsReceived = existingUser.friendRequestsReceived.filter((user: string) => user !== value);
          this.userRepository.save(targetUser2);
          this.userRepository.save(existingUser);
          throw new HttpException('User has blocked you', HttpStatus.CONFLICT);
        }
        targetUser2.friendRequestsSent = targetUser2.friendRequestsSent.filter((user: string) => user !== username);
        existingUser.friendRequestsReceived = existingUser.friendRequestsReceived.filter((user: string) => user !== value);
        targetUser2.friends.push(username);
        existingUser.friends.push(value);
        this.userRepository.save(targetUser2);
        break;
      case 'removefriendrequest':
        if (username == value)
        {
          throw new HttpException("That's you!", HttpStatus.CONFLICT);
        }
        if (!existingUser.friendRequestsSent.includes(value)) {
          throw new HttpException('No friend request sent to this user', HttpStatus.CONFLICT);
        }
        const targetUser6 = await this.userRepository.findOne({ where: { username: value } });
        if (!targetUser6) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        targetUser6.friendRequestsReceived = targetUser6.friendRequestsReceived.filter((user: string) => user !== username);
        existingUser.friendRequestsSent = existingUser.friendRequestsSent.filter((user: string) => user !== value);
        this.userRepository.save(targetUser6);
        break;
      case 'rejectfriendrequest':
        if (username == value)
        {
          throw new HttpException("That's you!", HttpStatus.CONFLICT);
        }
        const targetUser3 = await this.userRepository.findOne({ where: { username: value } });
        if (!targetUser3) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (!existingUser.friendRequestsReceived.includes(value)) {
          throw new HttpException('No friend request received from this user', HttpStatus.CONFLICT);
        }
        targetUser3.friendRequestsSent = targetUser3.friendRequestsSent.filter((user: string) => user !== username);
        existingUser.friendRequestsReceived = existingUser.friendRequestsReceived.filter((user: string) => user !== value);
        this.userRepository.save(targetUser3);
        break;
      case 'removefriend':
        if (username == value)
        {
          throw new HttpException("That's you!", HttpStatus.CONFLICT);
        }
        const targetUser4 = await this.userRepository.findOne({ where: { username: value } });
        if (!targetUser4) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if (!existingUser.friends.includes(value)) {
          throw new HttpException('User is not your friend', HttpStatus.CONFLICT);
        }
        targetUser4.friends = targetUser4.friends.filter((user: string) => user !== username);
        existingUser.friends = existingUser.friends.filter((user: string) => user !== value);
        this.userRepository.save(targetUser4);
        break;
      case 'unblockuser':
        if (username == value)
        {
          throw new HttpException("That's you!", HttpStatus.CONFLICT);
        }
        if (!existingUser.blockedUsers.includes(value)) {
          throw new HttpException('User is not blocked', HttpStatus.CONFLICT);
        }
        existingUser.blockedUsers = existingUser.blockedUsers.filter((user: string) => user !== value);
        break;
    }
    return this.userRepository.save(existingUser);
  }
  // DELETE USER --------------------------------------------------------------------------------------------
  async remove(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      return null; // User not found, nothing to remove
    }

    // Check if the user has friends
    if (user.friends && user.friends.length > 0) {
      console.log(user.friends)

      for (const friend of user.friends) {
        // Remove the user from the friend's friends list
        const target = await this.userRepository.findOne({ where: { username: friend}})
        target.friends = target.friends.filter((user: string) => user !== username);
        await this.userRepository.save(target);
      }
    }

    // Remove the user from the database
    await this.userRepository.remove(user);

    return user;
  }

  async userExists(username: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { username } });
    return !!user;
  }
}

export default UserService;
