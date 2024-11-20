import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/user.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        host: "postgres",
        port: 5432,
        username: "user",
        password: "password",
        database: "users_db",
        entities: [User],
        migrations: [__dirname + "/migrations/*.ts"],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
})
export class DatabaseModule {}
