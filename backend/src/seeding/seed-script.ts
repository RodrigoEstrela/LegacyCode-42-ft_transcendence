// src/seeding/seed-script.ts
import { postgresDataSource } from './dataSource';
import { Account } from '../entities/user.entity'; // Import your User entity or model
import { Seeder } from '@jorgebodega/typeorm-seeding'; // Import Factory from the seeding package
import { UserFactory } from './factories/user.factory';

export default class CreateUsers implements Seeder {
  public async run(): Promise<void> {
    const numberOfUsersToCreate = parseInt(process.env.NUM_USERS) || 10; // Default to 10 users if NUM_USERS is not defined
    await postgresDataSource.initialize();
    for (let i = 0; i < numberOfUsersToCreate; i++) {
      await new UserFactory().create(); // Use TypeORM factory to create users
    }

    console.log(`Created ${numberOfUsersToCreate} users.`);
  }
}
