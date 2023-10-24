import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm";
import { User } from '.';

@Entity('groupchat')
export class Groupchat {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column( 'json', { nullable: true } )
    members: string[];

    @Column( { nullable: true})
    owner: string;

    @Column( 'json', { nullable: true } )
    admins: string[];

    @Column( { nullable: true } )
    mode: string;

    @Column( { nullable: true })
    password: string;
}

export default Groupchat;
