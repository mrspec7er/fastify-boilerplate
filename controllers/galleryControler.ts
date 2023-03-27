import { FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import {
  badRequestResponse,
  errorResponse,
  mutationSuccessResponse,
} from "../utility/responseJson";

const prisma = new PrismaClient();

export async function createGallery(
  req: FastifyRequest<{
    Body: { name: string; tag: string };
  }>,
  rep: FastifyReply
) {
  const galleryImages = req.files;
  const { name, tag } = req.body;
  const tagList = JSON.parse(tag);
  const imageList: Array<string> = [];
  let errStatus = false;
  const maxSize = 3;
  try {
    if (!name || !Array.isArray(tagList) || !galleryImages.length) {
      throw new Error("Field undefine");
    }

    galleryImages.forEach((i) => {
      imageList.push(i.filename);
      if (i.size > maxSize * 1000 * 1024) {
        // check size or file extension
        errStatus = true;
      }
    });

    if (errStatus) {
      throw new Error("File doesn't match the requirement");
    }

    await prisma.galerry.create({
      data: {
        name,
        tag: tagList,
        image: imageList,
        ownerId: Number(req.id),
      },
    });

    return mutationSuccessResponse(rep, {
      message: "Succcessfully create gallery for " + req.email,
    });
  } catch (err: any) {
    if (galleryImages.length) {
      const deletedPromises: Array<any> = [];
      galleryImages.forEach((i) => {
        deletedPromises.push(fs.unlinkSync(i.path));
      });
      await Promise.all(deletedPromises);
    }
    return errorResponse(rep, err.message);
  }
}

export async function updateGallery(
  req: FastifyRequest<{
    Params: { id: string };
    Body: { name: string; tag: string };
  }>,
  rep: FastifyReply
) {
  const galleryImages = req.files;
  const { name, tag } = req.body;
  const tagList = JSON.parse(tag);
  const { id } = req.params;
  const imageList: Array<string> = [];
  let errStatus = false;
  const maxSize = 3;
  try {
    if (!name || !Array.isArray(tagList)) {
      throw new Error("Field undefine");
    }

    if (galleryImages.length) {
      galleryImages.forEach((i) => {
        imageList.push(i.filename);
        if (i.size > maxSize * 1000 * 1024) {
          // check size or file extension
          errStatus = true;
        }
      });
    }

    if (errStatus) {
      throw new Error("File doesn't match the requirement");
    }

    const gallery = await prisma.galerry.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!gallery) {
      return badRequestResponse(rep, "Incorrect gallery id");
    }
    const currentImageList = [...gallery.image, ...imageList];

    await prisma.galerry.update({
      data: {
        name,
        tag: tagList,
        image: currentImageList,
        ownerId: Number(req.id),
      },
      where: {
        id: Number(id),
      },
    });

    return mutationSuccessResponse(rep, {
      message: "Succcessfully create gallery for " + req.email,
    });
  } catch (err: any) {
    if (galleryImages.length) {
      const deletedPromises: Array<any> = [];
      galleryImages.forEach((i) => {
        deletedPromises.push(fs.unlinkSync(i.path));
      });
      await Promise.all(deletedPromises);
    }
    return errorResponse(rep, err.message);
  }
}

export async function deleteImageGallery(
  req: FastifyRequest<{
    Params: { id: string };
    Body: { imageName: string };
  }>,
  rep: FastifyReply
) {
  const { imageName } = req.body;
  const { id } = req.params;
  try {
    if (!imageName) {
      throw new Error("Field undefine");
    }

    const gallery = await prisma.galerry.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!gallery) {
      return badRequestResponse(rep, "Incorrect gallery id");
    }
    const imageList = gallery.image;

    if (!imageList.includes(imageName)) {
      badRequestResponse(rep, "Image name undefine");
    }

    fs.unlink("public/" + imageName, (err) => {
      if (err) {
        errorResponse(rep, err.message);
      }
    });
    const currentImageList = imageList.filter((i) => i !== imageName);

    await prisma.galerry.update({
      data: {
        image: currentImageList,
        ownerId: Number(req.id),
      },
      where: {
        id: Number(id),
      },
    });

    return mutationSuccessResponse(rep, {
      message: "Succcessfully delete image gallery for " + req.email,
    });
  } catch (err: any) {
    return errorResponse(rep, err.message);
  }
}
