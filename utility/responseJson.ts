import { FastifyReply } from "fastify";
function badRequestResponse(rep: FastifyReply, message: string) {
  return rep.status(400).send({
    status: false,
    message,
  });
}

function unauthorizeResponse(rep: FastifyReply) {
  return rep.status(401).send({
    status: false,
    message: "Unauthorize user",
  });
}

function loginRedirectResponse(rep: FastifyReply) {
  return rep.status(403).send({
    status: false,
    message: "Token expired",
  });
}

function notAllowedResponse(rep: FastifyReply) {
  return rep.status(405).send({
    status: false,
    message: "Request not allowed",
  });
}

function errorResponse(rep: FastifyReply, message: string) {
  return rep.status(500).send({
    status: false,
    message,
  });
}

function mutationSuccessResponse(rep: FastifyReply, data: any) {
  rep.status(201).send({
    status: true,
    data,
  });
}

function getSuccessResponse(rep: FastifyReply, data: any, meta?: any) {
  rep.status(200).send({
    status: true,
    data,
    meta,
  });
}

export {
  getSuccessResponse,
  mutationSuccessResponse,
  errorResponse,
  loginRedirectResponse,
  notAllowedResponse,
  unauthorizeResponse,
  badRequestResponse,
};
