import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageService, MessageController, Message } from ".";
import { User, UserService } from "../user";
import { GroupchatService } from "./groupchat/groupchat.service";
import { Groupchat } from "../entities";

@Module({
	imports: [
		TypeOrmModule.forFeature([Message]),
		TypeOrmModule.forFeature([User]),
		TypeOrmModule.forFeature([Groupchat]),
	],
	providers: [MessageService, UserService, GroupchatService],
	controllers: [MessageController],
})

export default class MessageModule {}
