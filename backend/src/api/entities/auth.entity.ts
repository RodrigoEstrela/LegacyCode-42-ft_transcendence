import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
