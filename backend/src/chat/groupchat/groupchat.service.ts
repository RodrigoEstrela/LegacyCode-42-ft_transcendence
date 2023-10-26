import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult, getRepository } from 'typeorm';
import { User } from '../../entities';
import { Groupchat } from '../../entities';

@Injectable()
export class GroupchatService {

    constructor(
        @InjectRepository(Groupchat)
        private groupchatRepository: Repository<Groupchat>,
    ) {}

    async findAll(): Promise<Groupchat[]> {
        return await this.groupchatRepository.find();
    }

    async findOne(name: string): Promise<Groupchat> {
        return await this.groupchatRepository.findOne({where: [{ name }]});
    }

    async create(name: string, members: string[], owner: string,
                 admins: string[], mode: string, password: string): Promise<Groupchat> {
        const groupchat = new Groupchat();
        groupchat.name = name;
        groupchat.members = members;
        groupchat.owner = owner;
        groupchat.admins = admins;
        groupchat.mode = mode;
        groupchat.password = password;
        return await this.groupchatRepository.save(groupchat);
    }

    async checkGroupchatExists(name: string): Promise<boolean> {
        const groupchat = await this.groupchatRepository.findOne({where: [{ name }]});
        return !!groupchat;
    }
}

export default GroupchatService;