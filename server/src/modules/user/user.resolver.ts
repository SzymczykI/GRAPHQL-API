import { Query, Resolver } from "type-graphql";
import { User } from "./user.dto";

@Resolver(() => User)
class UserResolver {
  @Query(() => User)
  user() {
    return {
      id: "2384387",
      email: "3242",
      username: "lolololo",
    };
  }
}

export default UserResolver;
