import prisma from "../../utils/prisma";
import { CreateMessageInput } from "./message.dto";

export const createMessage = ({ userId, ...input }: CreateMessageInput) => {
  return prisma.message.create({
    data: {
      ...input,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

export const findMessages = () => {
  return prisma.message.findMany();
};
