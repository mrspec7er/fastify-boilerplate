import { FastifyInstance } from "fastify";
import { updateProfile } from "../controllers/profileController";
import { verifyUserToken } from "../middleware/verifyToken";
import upload from "../middleware/upload";

async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", (req, rep, done) => {
    verifyUserToken(req, rep, ["USER", "ADMIN"]).then(() => {
      done();
    });
  });
  fastify.route({
    method: "PUT",
    url: "/profile",
    preHandler: upload(5).single("image"),
    handler: updateProfile,
  });
}

export default userRoutes;
