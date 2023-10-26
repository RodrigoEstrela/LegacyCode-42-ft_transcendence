import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('message')
export class Message {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    sender: string;

    @Column( {nullable: false})
    receiver: string;

    @Column({nullable: false})
    content: string;

    @Column({nullable: true})
    timestamp: string;

}

export default Message;
