export default class UserDto {
    readonly id: number;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly friends: string[];
    readonly friendRequests: string[];
    readonly stats: string[];
    readonly history: string[];
    readonly status: string;
}