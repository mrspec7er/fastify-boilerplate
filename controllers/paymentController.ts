import { FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";
const midtransClient = require("midtrans-client");

import {
  errorResponse,
  mutationSuccessResponse,
} from "../utility/responseJson";

const SERVER_KEY = process.env.SERVER_KEY;
const CLIENT_KEY = process.env.CLIENT_KEY;

export async function createTransaction(
  req: FastifyRequest<{
    Body: { orderId: string };
  }>,
  rep: FastifyReply
) {
  const { orderId } = req.body;
  try {
    if (!orderId) {
      throw new Error("Undefine order");
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: SERVER_KEY,
      clientKey: CLIENT_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 700000,
      },
      customer_details: {
        email: "miracle8oys@gmail.com",
        first_name: "Miracle",
        last_name: "Boy",
        phone: "+6281 1234 1234",
      },
      credit_card: {
        secure: true,
      },
    };

    await snap
      .createTransaction(parameter)
      .then((transaction: any) => {
        // transaction redirect_url
        const redirectUrl = transaction.redirect_url;
        return mutationSuccessResponse(rep, { data: redirectUrl });
      })
      .catch((err: any) => {
        errorResponse(rep, err.message);
      });
  } catch (err: any) {
    errorResponse(rep, err.message);
  }
}

export async function paymentNotification(
  req: FastifyRequest<{
    Body: {
      order_id: string;
      status_code: number;
      gross_amount: number;
      signature_key: string;
      transaction_status: string;
      fraud_status: string;
    };
  }>,
  rep: FastifyReply
) {
  const {
    order_id,
    status_code,
    gross_amount,
    signature_key,
    transaction_status,
    fraud_status,
  } = req.body;
  try {
    const createSignature = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + SERVER_KEY)
      .digest("hex");

    if (createSignature !== signature_key) {
      return console.log("ORDER ID: " + order_id + " UNAUTHORIZE");
    }
    if (
      (transaction_status === "settlement" ||
        transaction_status === "capture") &&
      fraud_status === "accept"
    ) {
      return console.log(
        "ORDER ID: " +
          order_id +
          " SUCCESS, STATUS ORDER CHANGE TO PAID, SEND EMAIL TO USER AND ADMIN"
      );
    } else if (
      (transaction_status === "pending" ||
        transaction_status === "authorize") &&
      fraud_status === "accept"
    ) {
      return console.log(
        "ORDER ID: " +
          order_id +
          " SUCCESS TO CREATED, SEND EMAIL TO USER FOR PAYMENT DETAIL"
      );
    } else {
      return console.log("Maybe there some issue in payment");
    }
  } catch (err: any) {
    return console.log(err);
  }
}

export const paymentSuccessRedirect = async (
  req: FastifyRequest,
  rep: FastifyReply
) => {
  try {
    return console.log("Data: ", req.query);
  } catch (err: any) {
    return console.log(err);
  }
};
