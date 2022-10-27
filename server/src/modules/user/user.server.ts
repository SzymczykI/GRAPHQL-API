import argon2 from "argon2";
import prisma from "../../utils/prisma";
import { RegisterUserInput } from "./user.dto";

export const createUser = async (input: RegisterUserInput) => {
  //hash password -> argon2
  const password = await argon2.hash(input.password);

  //insert user
  return prisma.user.create({
    data: {
      ...input,
      email: input.email.toLowerCase(),
      username: input.username.toLowerCase(),
      password,
    },
  });
};
