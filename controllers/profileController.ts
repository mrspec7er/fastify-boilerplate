import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import {
  errorResponse,
  mutationSuccessResponse,
} from "../utility/responseJson";

const prisma = new PrismaClient();

export async function updateProfile(
  req: FastifyRequest<{ Params: { userId: string }; Body: { bio: string } }>,
  rep: FastifyReply
) {
  const imageProfile = req.file;
  const { bio } = req.body;
  try {
    if (!bio) {
      throw new Error("Field undefine");
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: Number(req.id),
      },
    });

    if (profile && profile.image !== "public/default.png" && imageProfile) {
      fs.unlink("public/" + profile.image, (err) => {
        if (err) {
          return errorResponse(rep, err.message);
        }
      });
    }

    const updateData = imageProfile
      ? {
          bio,
          image: imageProfile.filename,
        }
      : {
          bio,
        };

    await prisma.profile.upsert({
      where: {
        userId: Number(req.id),
      },
      update: updateData,
      create: {
        bio,
        image: imageProfile ? imageProfile.filename : "default.png",
        userId: Number(req.id),
      },
    });
    return mutationSuccessResponse(rep, {
      message: "Succcessfully update profile for " + req.email,
    });
  } catch (err: any) {
    if (imageProfile) {
      fs.unlink(imageProfile.path, (err) => {
        if (err) {
          return errorResponse(rep, err.message);
        }
      });
    }
    return errorResponse(rep, err);
  }
}
