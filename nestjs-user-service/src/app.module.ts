import { Module } from "@nestjs/common";
import { DatabaseModule } from "./common/database.module";
import { UserModule } from "./users/user.module";

@Module({
  imports: [DatabaseModule, UserModule],
})
export class AppModule {}
