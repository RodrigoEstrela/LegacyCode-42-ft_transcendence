import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, User, Groupchat } from '../entities';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepository: Repository<Message>,
		@InjectRepository(User)
		private readonly userService: Repository<User>,
		@InjectRepository(Groupchat)
		private readonly groupChatService: Repository<Groupchat>,
	) {}

	async findByPair(sender: string, receiver: string): Promise<Message[]> {
		if (!await this.userService.findOne( {where: {username: sender}}) &&
			!await this.groupChatService.findOne( {where: {name: sender}}))
			return [];

		if (!await this.userService.findOne( {where: {username: receiver}}) &&
			!await this.groupChatService.findOne( {where: {name: receiver}}))
			return [];

		return await this.messageRepository.find({
			where: [
				{sender, receiver},
				{sender: receiver, receiver: sender},
			]
		});
	}

	async create(sender: string, receiver: string, content: string, timestamp: string): Promise<Message> {
		const message = new Message();
		message.sender = sender;
		message.receiver = receiver;
		message.content = content;
		message.timestamp = timestamp;
		return await this.messageRepository.save(message);
	}
}

export default MessageService;
