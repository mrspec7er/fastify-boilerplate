import { FastifyInstance } from "fastify";
import {
  createUser,
  login,
  getAllUsers,
  refreshToken,
  sendResetPassword,
  resetPassword,
} from "../controllers/userControler";
import { verifyUserToken } from "../middleware/verifyToken";

async function userRoutes(fastify: FastifyInstance) {
  // fastify.addHook("preHandler", (req, rep, done) => {
  //   verifyUserToken(req, rep, ["USER"]);
  //   done();
  // });
  fastify.route({
    method: "POST",
    url: "/register",
    handler: createUser,
  });
  fastify.route({
    method: "POST",
    url: "/login",
    handler: login,
  });
  fastify.route({
    method: "POST",
    url: "/refresh-token",
    handler: refreshToken,
  });
  fastify.route({
    method: "POST",
    url: "/send-reset-password",
    handler: sendResetPassword,
  });
  fastify.route({
    method: "POST",
    url: "/reset-password",
    handler: resetPassword,
  });
  fastify.route({
    method: "GET",
    url: "/user",
    handler: getAllUsers,
  });
}

export default userRoutes;
