import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserStats } from '../user';

@Entity('user')
export class Account {

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
  history: string[];

  @Column('json', { nullable: true })
  status: string;

}

export default Account;
