import Account from "src/entities/user.entity"
import { DataSource } from "typeorm"

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

postgresDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized.")
    })
    .catch((err) => {
        console.error("Error during initialization", err)
    })
