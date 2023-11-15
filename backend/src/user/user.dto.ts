import {UserHistory, UserStats} from "./user.types";

export default class UserDto {
    readonly id: number;
    readonly username: string;
    readonly email: string;
    readonly password: string;
    readonly friends: string[];
    readonly friendRequestsReceived: string[];
    readonly friendRequestsSent: string[];
    readonly blockedUsers: string[];
    readonly stats: UserStats;
    readonly history: UserHistory;
    readonly status: string;
    readonly chatSocket: string;
    readonly groupChats: string[];
    readonly gameSocket: string;
}