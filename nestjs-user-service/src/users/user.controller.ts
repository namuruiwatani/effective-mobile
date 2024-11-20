import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("reset-problems")
  async resetProblems() {
    const count = await this.userService.resetProblems();
    return { message: `${count} users had problems flag set to true` };
  }
}
