import { Factory, Seeder } from "typeorm-seeding";

import { User } from "../../entities";

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    const users = await factory(User)().createMany(15);
  }
}