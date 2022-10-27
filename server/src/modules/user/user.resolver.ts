import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Context } from "../../utils/createServer";
import { RegisterUserInput, User } from "./user.dto";
import { createUser } from "./user.server";

@Resolver(() => User)
class UserResolver {
  @Mutation(() => User)
  async register(@Arg("input") input: RegisterUserInput) {
    try {
      const user = await createUser(input);
      return user;
    } catch (error) {
      //check if violates uniqe constraints (if user is registered)
      throw error;
    }
  }

  @Query(() => User)
  me(@Ctx() context: Context){
    return context.user
  }
}

export default UserResolver;
