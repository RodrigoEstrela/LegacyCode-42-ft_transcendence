// Pulga review 18/09/22 -> OK
// Use faker properly, see: [https://www.npmjs.com/package/@faker-js/faker]
// Typeorm factory, see: [https://www.npmjs.com/package/@jorgebodega/typeorm-factory]

import { faker } from "@faker-js/faker";
import { User } from '../../entities';
import { UserStats } from '../../user';
import { Factory, FactorizedAttrs } from '@jorgebodega/typeorm-factory'
import { postgresDataSource } from '../dataSource'

const tmp_stats: UserStats = {
	"Games Played": faker.number.int(),
  "Wins": faker.number.int(),
  "Losses": faker.number.int(),
  "Score": faker.number.int(),
  "Rank": "",
  "Achievements": "",
}

export class UserFactory extends Factory<User> {
  protected entity = User;
  protected dataSource = postgresDataSource;
  protected attrs(): FactorizedAttrs<User> {
    return {
			username: faker.internet.userName(),
			email: faker.internet.email(),
			password: faker.internet.password(7),
		  stats: tmp_stats,
			avatar: "",
			friends: [],
			friendRequestsReceived: [],
			friendRequestsSent: [],
			blockedUsers: [],
			history: [],
			status: "online",
    }
  }
}