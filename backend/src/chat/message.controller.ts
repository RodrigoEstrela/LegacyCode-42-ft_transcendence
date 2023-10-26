import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { MessageService } from "./message.service";
import  MessageDto from "./message.dto";

@Controller('message')
export class MessageController {

	constructor(private readonly messageService: MessageService) {}

	@Post('create')
	async createMessage(@Body() createMessageDto: MessageDto) {
		const { sender, receiver, content, timestamp } = createMessageDto;
		console.log('Received create message request');
		const messageCreated = await this.messageService.create(sender, receiver, content, timestamp);
		console.log(messageCreated);
		return messageCreated;
	}

	@Get(':sender/:receiver')
	async findByPair(@Param('sender') sender: string, @Param('receiver') receiver: string) {
		return await this.messageService.findByPair(sender, receiver);
	}
}

export default MessageController;
