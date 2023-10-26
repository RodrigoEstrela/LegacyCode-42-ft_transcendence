import {Controller, Get, Post, Body, HttpException, HttpStatus, Param} from "@nestjs/common";
import { GroupchatService } from "./groupchat.service";
import GroupchatDto from "./groupchat.dto";

@Controller('groupchat')
export class GroupchatController {

	constructor(private readonly groupchatService: GroupchatService) {}

	@Post('create')
	async createGroupchat(@Body() createGroupchatDto: GroupchatDto) {
		const { name, members, owner, admins, mode, password} = createGroupchatDto;

		// Check if a groupchat with the same name already exists
		const groupchatExists = await this.groupchatService.checkGroupchatExists(name);
		if (groupchatExists) {
			throw new HttpException(
				'Groupchat with the same name already exists',
				HttpStatus.CONFLICT,
			);
		}
		// If no groupchat with the same name exists, create the groupchat
		console.log('Received create groupchat request');
		const groupchatCreated = await this.groupchatService.create(name, members, owner, admins, mode, password);
		console.log(groupchatCreated);
		return groupchatCreated;
	}

	@Get()
	async findAll() {
		return await this.groupchatService.findAll();
	}

	@Get(':name')
	async findOne(@Param('name') name: string) {
		return await this.groupchatService.findOne(name);
	}
}

export default GroupchatController;
