import { EntityRepository, Repository } from "typeorm";
import  MessageDto  from "./message.dto";
import { default as Message } from "../entities/message.entity";

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
	async createMessage(messageDto: MessageDto): Promise<Message> {
		const message = this.create();
		return this.save(message); // Save the user using the repository's save() method
	}
}

export default MessageRepository;