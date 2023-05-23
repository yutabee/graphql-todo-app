import { ApolloServer, gql } from "apollo-server-micro";
import { PrismaClient } from "@prisma/client";
import { IResolvers } from "@graphql-tools/utils";
import Cors from "micro-cors";
import { IncomingMessage, ServerResponse } from "http";

const cors = Cors();
const prisma = new PrismaClient();

const typeDefs = gql`
  type Todo {
    id: Int!
    text: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo!]!
  }
`;

const resolvers: IResolvers = {
  Query: {
    todos: async () => await prisma.todo.findMany(),
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});
const startServer = apolloServer.start();

export default cors(async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }
  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
