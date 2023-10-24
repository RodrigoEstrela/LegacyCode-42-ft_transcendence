import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Groupchat } from "../entities";
import { GroupchatService } from "./groupchat.service";
import { GroupchatController } from "./groupchat.controller";

@Module({
	imports: [TypeOrmModule.forFeature([Groupchat])],
	providers: [GroupchatService],
	controllers: [GroupchatController],
	exports: [GroupchatService],
})

export default class GroupchatModule {
	constructor(){}
}
