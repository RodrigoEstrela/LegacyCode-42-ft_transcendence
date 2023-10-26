import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { default as Message } from "../entities/message.entity";
import { User } from "../user";
import { UserService } from "../user";


@Module({
	imports: [
		TypeOrmModule.forFeature([Message]),
		TypeOrmModule.forFeature([User]),
	],
	providers: [MessageService, UserService],
	controllers: [MessageController],
})

export default class MessageModule {}
