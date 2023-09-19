// Pulga review 18/09/22 -> OK
// Use faker properly, see: [https://www.npmjs.com/package/@faker-js/faker]
// Typeorm factory, see: [https://www.npmjs.com/package/@jorgebodega/typeorm-factory]
import { faker } from "@faker-js/faker";
import { User } from '../../entities';
import { UserStats } from '../../user';
import { Factory, FactorizedAttrs } from '@jorgebodega/typeorm-factory'
import { postgresDataSource } from '../dataSource'

export class UserFactory extends Factory<User> {
  protected entity = User;
  protected dataSource = postgresDataSource;
  protected attrs(): FactorizedAttrs<User> {
	const wins = faker.number.int(7);
	const losses = faker.number.int(7);
	const gamesPlayed = wins + losses;
	var score = (wins * 10) - (losses * 5);
	if (score < 0) {
	score = 0;
	}
	const tmp_stats: UserStats = {
	'Games Played': gamesPlayed,
	'Wins': wins,
	'Losses': losses,
	'Score': score,
	'Rank': "",
	'Achievements': "",
	};
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
