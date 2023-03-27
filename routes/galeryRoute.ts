import { FastifyInstance } from "fastify";
import {
  createGallery,
  updateGallery,
  deleteImageGallery,
} from "../controllers/galleryControler";
import { verifyUserToken } from "../middleware/verifyToken";
import upload from "../middleware/upload";

async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", (req, rep, done) => {
    verifyUserToken(req, rep, ["USER", "ADMIN"]).then(() => {
      done();
    });
  });
  fastify.route({
    method: "POST",
    url: "/gallery",
    preHandler: upload(10).array("image"),
    handler: createGallery,
  });
  fastify.route({
    method: "PUT",
    url: "/gallery/:id",
    preHandler: upload(10).array("image"),
    handler: updateGallery,
  });
  fastify.route({
    method: "DELETE",
    url: "/gallery/:id",
    handler: deleteImageGallery,
  });
}

export default userRoutes;
