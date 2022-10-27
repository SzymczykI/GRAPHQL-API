import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-fastify";
import { ApolloServerPlugin } from "apollo-server-plugin-base";
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { execute, GraphQLSchema, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { buildSchema } from "type-graphql";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import UserResolver from "../modules/user/user.resolver";

const app = fastify();

app.register(fastifyCors, {
  //credentials true because I'm gonna set cookies
  credentials: true,
  //I'm allowing more than one origin
  origin: (origin, cb) => {
    if (
      !origin ||
      ["http://localhost:3000", "https://studio.apollographql.com"].includes(
        origin
      )
    ) {
      return cb(null, true);
    }

    return cb(new Error("Not allowed"), false);
  },
});

app.register(fastifyCookie, {
  parseOptions: {},
});

app.register(fastifyJwt, {
  secret: "change-me",
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

//custom plugin to stop server
const fastifyAppClosePlugin = (app: FastifyInstance): ApolloServerPlugin => {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
};

const buildContext = async ({
  request,
  reply,
  connectionParams,
}: {
  request?: FastifyRequest;
  reply?: FastifyReply;
  connectionParams?: {
    Authorization: string
  };
}) => {

if(connectionParams || !request) {
    try {
        return {
            user: await app.jwt.verify(connectionParams?.Authorization || '')
        }
    } catch (error) {
        return { user: null}
    }
}

  try {
    const user = await request?.jwtVerify();
    return { request, reply, user };
  } catch (error) {
    return { request, reply, user: null };
  }
};

export type Context = Awaited<ReturnType<typeof buildContext>>

export const createServer = async () => {
  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const server = new ApolloServer({
    schema,
    plugins: [
      fastifyAppClosePlugin(app),
      ApolloServerPluginDrainHttpServer({ httpServer: app.server }),
    ],
    context: buildContext,
  });

  return { app, server };
};

const subscriptionServer = ({
  schema,
  server,
}: {
  schema: GraphQLSchema;
  server: ApolloServer;
}) => {
  return SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      async onConnect(connectionParams: Object) {
        return buildContext({ connectionParams });
      },
    },
    {
      server,
      path: "graphgl",
    }
  );
};
