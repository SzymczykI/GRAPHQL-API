import argon2 from "argon2";
import prisma from "../../utils/prisma";
import { LoginInput, RegisterUserInput } from "./user.dto";

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

export const findUserByEmailOrUsername = async (
  input: LoginInput["usernameOrEmail"]
) => {
  return prisma.user.findFirst({
    where: {
      OR: [{ username: input }, { email: input }],
    },
  });
};

export const verifyPassword = async ({
  password,
  candidatePassword,
}: {
  password: string;
  candidatePassword: string;
}) => {
  return argon2.verify(password, candidatePassword);
};

export const followUser = async ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      following: {
        connect: {
          username,
        },
      },
    },
  });
};

export const unfollowUser = async ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      following: {
        disconnect: {
          username,
        },
      },
    },
  });
};

export const findUsers = async () => {
  return prisma.user.findMany();
};

export const findUserFollowing = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      following: true,
    },
  });
};

export const findUserFollowedBy = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      followedBy: true,
    },
  });
};

export const findUserById = async (userId: string) => {
  return prisma.user.findFirst({
    where: {
      id: userId,
    },
  });
};
