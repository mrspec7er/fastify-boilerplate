import { FastifyInstance } from "fastify";
import {
  createTransaction,
  paymentNotification,
  paymentSuccessRedirect,
} from "../controllers/paymentController";

async function userRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/payment",
    handler: createTransaction,
  });
  fastify.route({
    method: "POST",
    url: "/payment-notif",
    handler: paymentNotification,
  });
  fastify.route({
    method: "GET",
    url: "/success-redirect",
    handler: paymentSuccessRedirect,
  });
}

export default userRoutes;
