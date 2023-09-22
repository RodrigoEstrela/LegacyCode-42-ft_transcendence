import { Connection, DataSource } from "typeorm"
import { Seeder } from "@jorgebodega/typeorm-seeding";
import { Factory } from "@jorgebodega/typeorm-factory";
import { UserFactory } from "../factories/user.factory";
import { User } from "../../entities";
import { postgresDataSource } from "../dataSource";

export default class InitialDatabaseSeed implements Seeder {
   async run(dataSource: DataSource) {
  	await new UserFactory().createMany(10);
  }
}
