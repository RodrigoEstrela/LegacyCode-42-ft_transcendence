import {Controller, Get, Post, Body, HttpException, HttpStatus, Param, Headers} from "@nestjs/common";
import { GroupchatService } from "./groupchat.service";
import GroupchatDto from "./groupchat.dto";

@Controller('gc')
export class GroupchatController {

	constructor(private readonly groupchatService: GroupchatService) {}

	@Post('create')
	async createGroupchat(@Body() createGroupchatDto: GroupchatDto, @Headers() headers: Record<string, string>) {
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
		console.log(headers['sender'])
		const groupchatCreated = await this.groupchatService.create(name, members, headers['sender'], admins, mode, password);
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

	@Post(':name/:command/:value')
	async manageGroupchat(
		@Param('name') name: string,
		@Param('command') command: string,
		@Param('value') value: string,
		@Headers() headers: Record<string, string>) {

		console.log('Received manage groupchat request');
		const sender = headers['sender'];
		const groupchatExists = await this.groupchatService.checkGroupchatExists(name);
		if (!groupchatExists) {
			console.log('Groupchat not found');
			throw new HttpException('Groupchat not found', HttpStatus.NOT_FOUND);
		}

		return await this.groupchatService.manageGroupchat(name, command, value, sender);
	}

	// @Post()
	// async sendMessageToUsers
}

export default GroupchatController;
