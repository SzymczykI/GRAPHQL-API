import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-fastify";
import fastify from "fastify";
import { buildSchema } from "type-graphql";
import UserResolver from "../modules/user/user.resolver";

const app = fastify();

const buildContext = () => {

}

export const createServer = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer: app.server })],
    context: buildContext
  });

  return { app, server }
};
