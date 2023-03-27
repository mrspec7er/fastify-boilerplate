import { FastifyReply, FastifyRequest } from "fastify";
import { createDecoder } from "fast-jwt";
import { PrismaClient, Role } from "@prisma/client";
import {
  loginRedirectResponse,
  unauthorizeResponse,
  badRequestResponse,
} from "../utility/responseJson";

const decode = createDecoder();
const prisma = new PrismaClient();

export async function verifyUserToken(
  req: FastifyRequest,
  rep: FastifyReply,
  roles: Array<Role>
) {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return unauthorizeResponse(rep);
    }

    const payload = decode(accessToken);

    if (payload.exp < new Date().getTime() / 1000) {
      loginRedirectResponse(rep);
    }

    if (!payload.email) {
      return unauthorizeResponse(rep);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!user || !roles.includes(user.role)) {
      return unauthorizeResponse(rep);
    }

    req.email = user.email;
    req.id = user.id;

    return user.email;
  } catch (err) {
    return badRequestResponse(rep, "Cannot verify user");
  }
}
