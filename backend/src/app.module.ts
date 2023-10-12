import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Auth, AuthModule, AuthController, AuthService } from './authentication';
import { User, UserModule, UserController, UserService } from './user';
import { config } from 'dotenv';
import { ChatGateway }  from './chat/app.gateway';
// import { UserFactory } from "src/seeding/factories/user.factory"

config();

@Module({
  imports: [
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: process.env.POSTGRES_CONTAINER,
		port: parseInt(process.env.POSTGRES_PORT_DOCKER),
		username: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DB,
		synchronize: true,
		autoLoadEntities: true,
	}),
	TypeOrmModule.forFeature([Auth]),
	AuthModule,
	TypeOrmModule.forFeature([User]),
	UserModule,
],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService, ChatGateway],
})

export class AppModule {}

// export class AppModule {
// 	// // Commit changes to DB:
// 	// // See: [https://docs.nestjs.com/techniques/database]
// 	constructor(dataSource: DataSource) {
// 	  try {
// 	    // // Generate one factory entry, you can create more like this:
// 	    // // make will not save to db
// 	    // // create will save to db
// 	    // // new UserFactory().makeMany(10);
// 			dataSource.transaction(async manager => {
// 			  let u = await new UserFactory().makeMany(10);
// 				manager.save(u);
// 			});
// 	    console.log("Success");
// 	  } catch (err) {
// 	    console.log(err);
// 	    console.log("Failed");
// 	  } finally {
// 	    console.log("Continue to start app...")
// 	  }
// 	}
// }
