import { ApolloError } from "apollo-server-core";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Context } from "../../utils/createServer";
import {
  FollowUserInput,
  LoginInput,
  RegisterUserInput,
  User,
  UserFollowers,
} from "./user.dto";
import {
  createUser,
  findUserByEmailOrUsername,
  findUserFollowing,
  findUsers,
  followUser,
  verifyPassword,
} from "./user.service";

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
  me(@Ctx() context: Context) {
    return context.user;
  }

  @Mutation(() => String)
  async login(@Arg("input") input: LoginInput, @Ctx() context: Context) {
    const user = await findUserByEmailOrUsername(
      input.usernameOrEmail.toLowerCase()
    );

    if (!user) {
      throw new ApolloError("Invalid credentials");
    }

    const isValid = await verifyPassword({
      password: user.password,
      candidatePassword: input.password,
    });

    if (!isValid) throw new ApolloError("Invalid credentials");

    const token = await context.reply?.jwtSign({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    if (!token) throw new ApolloError("Invalid token");
    //create cookie and add to reply
    context.reply?.setCookie("token", token, {
      domain: "localhost",
      path: "/",
      secure: false,
      httpOnly: true,
      sameSite: false,
    });

    return token;
  }

  @Query(() => [User])
  async users() {
    return findUsers();
  }

  @Mutation(() => User)
  async followUser(
    @Arg("input") input: FollowUserInput,
    @Ctx() context: Context
  ) {
    try {
      const result = await followUser({ ...input, userId: context.user?.id! });
      return result;
    } catch (error: any) {
      throw new ApolloError(error);
    }
  }

  @FieldResolver(() => UserFollowers)
  followers() {
    return {
      count: 0,
      items: [],
    };
  }

  @FieldResolver(() => UserFollowers)
  async following(@Ctx() context: Context) {
    const data = await findUserFollowing(context.user?.id!);

    return {
      count: data?.following.length,
      items: data?.following,
    };
  }
}

export default UserResolver;
