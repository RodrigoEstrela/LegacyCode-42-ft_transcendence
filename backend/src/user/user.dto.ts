import { UserStats } from "./user.types";

export default class UserDto {
    readonly id: number;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly friends: string[];
    readonly friendRequests: string[];
    readonly blocked: string[];
    readonly stats: UserStats;
    readonly history: string[];
    readonly status: string;
}