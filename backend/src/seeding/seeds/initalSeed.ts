// Pulga review 18/09/22 -> NOT OK
/**
 * Review
 * 1.
 * Should declare the class function as described on the documentation
 * 	See: [https://www.npmjs.com/package/typeorm-seeding#seeder]
 * 2.
 * Must import Connection from typeorm
 **/

import { Connection } from "typeorm"
import { Factory, Seeder } from "typeorm-seeding";
import { User } from "../../entities";

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
  	await factory(User)().createMany(7);
  }
}
