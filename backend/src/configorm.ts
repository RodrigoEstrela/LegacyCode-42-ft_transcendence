import { User } from "./entities";

export default {
  name: "default",
  type: "postgres",
  host: process.env.POSTGRES_CONTAINER,
  port: 5432, 
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User],
  synchronize: true, // Set this to true for development, but consider disabling it in production.
  logging: false,
  seeds: ["./seeding/seeds/initalSeed.ts"],
  factories: ["./seeding/factories/user.factory.ts"],
};
