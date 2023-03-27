import { PrismaClient } from "@prisma/client";
import { RoleType, UserType } from "../utility/dataInterface";
import { resetPasswordEmailTemplate, sendEmail } from "../utility/emailService";
import bcrypt from "bcrypt";
import { createSigner, createDecoder } from "fast-jwt";
import {
  badRequestResponse,
  errorResponse,
  getSuccessResponse,
  notAllowedResponse,
  mutationSuccessResponse,
  unauthorizeResponse,
} from "../utility/responseJson";
import { FastifyRequest, FastifyReply } from "fastify";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL!;
const SMTP_USER = process.env.SMPT_USER!;
const RECOVERY_EMAIL = process.env.RECOVERY_EMAIL!;

const prisma = new PrismaClient();
const accessTokensignature = createSigner({
  key: ACCESS_TOKEN_SECRET,
  expiresIn: 24 * 60 * 60 * 1000,
});
const refreshTokenSignature = createSigner({
  key: REFRESH_TOKEN_SECRET,
  expiresIn: 7 * 24 * 60 * 60 * 1000,
});
const decode = createDecoder();

async function createAccesToken(email: string) {
  const token = accessTokensignature({ email });
  return token;
}

async function createRefreshToken(email: string) {
  const token = refreshTokenSignature({ email });
  return token;
}

export const createUser = async (
  req: FastifyRequest<{ Body: UserType }>,
  rep: FastifyReply
) => {
  const { name, email, password, role } = req.body;

  try {
    if (!email || !password) {
      return badRequestResponse(rep, "Email and password required");
    }

    const encryptedPassword = await bcrypt.hash(password, 11);
    if (role in RoleType) {
      await prisma.user.create({
        data: {
          name,
          email,
          password: encryptedPassword,
          role,
        },
      });

      return mutationSuccessResponse(rep, "Register Success");
    } else {
      return badRequestResponse(rep, "User role undefine");
    }
  } catch (err: any) {
    return errorResponse(rep, err.message);
  }
};

export async function login(
  req: FastifyRequest<{ Body: UserType }>,
  rep: FastifyReply
) {
  const { email, password } = req.body;

  try {
    const userData = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userData) {
      return badRequestResponse(rep, "Email undefine");
    }

    const checkPassword = await bcrypt.compare(password, userData.password);

    if (!checkPassword) {
      return badRequestResponse(rep, "Invalide password");
    }

    const accessToken = await createAccesToken(userData.email);
    const refreshToken = await createRefreshToken(userData.email);

    return mutationSuccessResponse(rep, {
      accessToken,
      refreshToken,
      name: userData.name,
    });
  } catch (err: any) {
    return errorResponse(rep, err.message);
  }
}

export async function refreshToken(
  req: FastifyRequest<{ Body: { refreshToken: string } }>,
  rep: FastifyReply
) {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return notAllowedResponse(rep);
    }

    const payload = decode(refreshToken);
    if (payload.exp < new Date().getTime() / 1000) {
      notAllowedResponse(rep);
    }
    if (!payload.email) {
      return notAllowedResponse(rep);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: await payload.email,
      },
    });

    if (!user) {
      return notAllowedResponse(rep);
    }

    const accessToken = await createAccesToken(user.email);

    return mutationSuccessResponse(rep, { accessToken });
  } catch (err: any) {
    return errorResponse(rep, err.message);
  }
}

export async function sendResetPassword(
  req: FastifyRequest<{ Body: UserType }>,
  rep: FastifyReply
) {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return badRequestResponse(rep, "Email undefine");
    }
    const accessToken = await createAccesToken(user.email);
    const resetPasswordURL =
      FRONTEND_BASE_URL + "/reset-password/" + accessToken;

    const emailBody = resetPasswordEmailTemplate("Prohita", resetPasswordURL);

    const mailOptions = {
      from: SMTP_USER!,
      to: RECOVERY_EMAIL!,
      subject: "RESET PASSWORD",
      html: emailBody,
    };

    await sendEmail(mailOptions);

    return mutationSuccessResponse(
      rep,
      "Reset password url successfully send to your email"
    );
  } catch (err: any) {
    return errorResponse(rep, err.message);
  }
}

export async function resetPassword(
  req: FastifyRequest<{
    Body: { newPassword: string };
    Querystring: { resetToken: string };
  }>,
  rep: FastifyReply
) {
  const { resetToken } = req.query;
  const { newPassword } = req.body;
  try {
    if (!newPassword) {
      return badRequestResponse(rep, "New password field required");
    }
    const accessToken = resetToken;

    const payload = decode(accessToken);
    if (payload.exp < new Date().getTime() / 1000) {
      notAllowedResponse(rep);
    }

    if (!payload.email) {
      return unauthorizeResponse(rep);
    }
    const userData = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!userData) {
      return unauthorizeResponse(rep);
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 11);
    const user = await prisma.user.update({
      data: {
        password: encryptedPassword,
      },
      where: {
        email: userData?.email,
      },
    });

    return mutationSuccessResponse(
      rep,
      "Successfully create account for " + user.email
    );
  } catch (err: any) {
    return errorResponse(rep, err.message);
  }
}

export async function getAllUsers(
  req: FastifyRequest<{ Body: null }>,
  rep: FastifyReply
) {
  try {
    const users = await prisma.user.findMany({
      include: {
        Profile: true,
        Galerry: true,
      },
    });
    return getSuccessResponse(rep, users);
  } catch (err: any) {
    return errorResponse(rep, err.message);
  }
}
