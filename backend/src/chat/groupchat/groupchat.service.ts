import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Groupchat, User } from '../../entities';

@Injectable()
export class GroupchatService {
    constructor(
        @InjectRepository(Groupchat)
        private groupchatRepository: Repository<Groupchat>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<Groupchat[]> {
        return await this.groupchatRepository.find();
    }

    async findOne(name: string): Promise<Groupchat> {
        return await this.groupchatRepository.findOne({where: [{ name }]});
    }

    async addGroupChat(username: string, groupChat: string) : Promise<void> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (user) {
            user.groupChats.push(groupChat);
            await this.userRepository.save(user);
        }
    }
    async create(name: string, members: string[], owner: string,
                 admins: string[], mode: string, password: string): Promise<Groupchat> {
        const groupchat = new Groupchat();
        admins.push(owner);
        members.push(owner);
        if (name.length == 0) {
            name = owner + "_Groupchat";
        }
        groupchat.name = name;
        groupchat.members = members;
        groupchat.owner = owner;
        groupchat.admins = admins;
        groupchat.mode = mode;
        groupchat.password = password;

        await this.addGroupChat(owner, name);
        return await this.groupchatRepository.save(groupchat);
    }

    async checkGroupchatExists(name: string): Promise<boolean> {
        const groupchat = await this.groupchatRepository.findOne({where: [{ name }]});
        return !!groupchat;
    }

    async checkIsAdmin(name: string, sender: string): Promise<boolean> {
        const groupchat = await this.groupchatRepository.findOne({where: [{ name }]});
        return groupchat.admins.includes(sender);
    }

    async manageGroupchat(name: string, command: string, value: string, sender: string): Promise<Groupchat> {
        const groupchat = await this.groupchatRepository.findOne({where: [{ name }]});
        if (sender != groupchat.owner && !groupchat.admins.includes(sender)) {
            throw new HttpException('You are not authorized to manage this groupchat', HttpStatus.UNAUTHORIZED);
        }
        if (command == "addMember") {
            groupchat.members.push(value);
        } else if (command == "removeMember") {
            const index = groupchat.members.indexOf(value);
            if (index > -1) {
                groupchat.members.splice(index, 1);
            }
        } else if (command == "addAdmin") {
            groupchat.admins.push(value);
        } else if (command == "removeAdmin") {
            const index = groupchat.admins.indexOf(value);
            if (index > -1) {
                groupchat.admins.splice(index, 1);
            }
        } else if (command == "changeMode") {
            groupchat.mode = value;
        } else if (command == "changePassword") {
            groupchat.password = value;
        } else {
            throw new HttpException('Invalid command', HttpStatus.BAD_REQUEST);
        }
        return await this.groupchatRepository.save(groupchat);
    }

    async getGroupchatMembers(name: string): Promise<string[]> {
        const groupchat = await this.groupchatRepository.findOne({where: [{ name }]});
        return groupchat.members;
    }

}

export default GroupchatService;
