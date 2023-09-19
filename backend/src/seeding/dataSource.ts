import { DataSource } from 'typeorm'
import { Account } from '../entities/user.entity';
//See: [https://orkhan.gitbook.io/typeorm/docs/data-source]

export const postgresDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_CONTAINER,
  port: parseInt(process.env.POSTGRES_PORT_DOCKER),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    Account
  ],
})