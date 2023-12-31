import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserStats, UserHistory } from '../user';

@Entity('user')
export class User {

// User profile info
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column('json', { nullable: true })
  password: string;

  @Column({ nullable: true })
  avatar: string;

// Other users info
  @Column('json', { nullable: true })
  friends: string[];

  @Column('json', { nullable: true })
  friendRequestsReceived: string[];

  @Column('json', { nullable: true })
  friendRequestsSent: string[];

  @Column('json', { nullable: true })
  blockedUsers: string[];

// User games info
  @Column('json', { nullable: true })
  stats: UserStats;

  @Column('json', { nullable: true })
  history: UserHistory;

  @Column('json', { nullable: true })
  status: string;

// Chat info
  @Column('json', {nullable: true})
  chatSocket: string;

  @Column('json', {nullable: true})
  groupChats: string[];

// Game info
  @Column('json', {nullable: true})
  gameSocket: string;

}

export default User;
