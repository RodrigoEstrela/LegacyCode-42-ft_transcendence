import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Groupchat, GroupchatService, GroupchatController } from "../";
import { User, UserService } from "../../user/";
@Module({
	imports: [
		TypeOrmModule.forFeature([Groupchat]),
		TypeOrmModule.forFeature([User]),
	],
	providers: [GroupchatService, UserService],
	controllers: [GroupchatController],
	exports: [GroupchatService],
})

export default class GroupchatModule {
	constructor(){}
}
