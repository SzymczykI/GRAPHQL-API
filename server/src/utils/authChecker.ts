import { AuthChecker } from "type-graphql";
import { Context } from "./createServer";

export const authChecker: AuthChecker<Context> = ({ context }) => {
  if (context.user) return true;

  return false;
};
