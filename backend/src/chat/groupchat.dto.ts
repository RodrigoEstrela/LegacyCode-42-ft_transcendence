export default class GroupchatDto {
	readonly name: string;
	readonly members: string[];
	readonly owner: string;
	readonly admins: string[];
	readonly mode: string;
	readonly password: string;
}
