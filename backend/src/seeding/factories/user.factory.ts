// import faker from "@faker-js/faker";
// import { define } from 'typeorm-seeding';
// import { User } from '../../entities';
// import { UserStats } from '../../user';

// define(User, (faker) => {
//   const username = faker.internet.userName(7);
//   const email = faker.internet.email(14);
//   const password = faker.internet.password(7);

//   // You can generate random user stats or set them to initial values

//   const wins = faker.random.number(7);
//   const losses = faker.random.number(7);
//   const gamesPlayed = wins + losses;
//   var score = (wins * 10) - (losses * 5);
//   if (score < 0) {
// 	score = 0;
//   }
//   const stats: UserStats = {
//     'Games Played': gamesPlayed,
//     'Wins': wins,
//     'Losses': losses,
//     'Score': score,
//     'Rank': "",
//     'Achievements': "",
//   };

//   const user = new User();
//   user.username = username;
//   user.email = email;
//   user.password = password;
//   user.avatar = "";
//   user.friends = [];
//   user.friendRequestsReceived = [];
//   user.friendRequestsSent = [];
//   user.blockedUsers = [];
//   user.stats = stats;
//   user.history = [];
//   user.status = "online";

//   return user;
// });
