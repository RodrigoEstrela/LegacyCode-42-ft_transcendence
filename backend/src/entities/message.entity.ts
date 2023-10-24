import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('message')
export class Message {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    sender: string;

    @Column()
    receiver: string;

    @Column()
    content: string;

    @Column()
    timestamp: string;
}

export default Message;
