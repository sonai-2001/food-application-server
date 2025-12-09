import { NextFunction, Request, Response } from "express";
import { check } from "express-validator";
import { ApiError } from "../utils/ApiError";

export const requestvalidator = [
  check(
    "userName",
    "Please Enter a valid userName which has atlreast 5 charecters"
  )
    .not()
    .isEmpty()
    .isLength({
      min: 5,
    }),
  check("email", "Please enter a valid email ...").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "The password must be greater than 4 digits").isLength({
    min: 5,
  }),
];

export const sendMailVerificator = [
  check("email", "Please enter a valid email ...").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];

export const adminValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminUserName = "TheLucifer11";
    const adminPassword = "amit2006*";

    const { userName, password } = req.query;

    if (!userName || !password) {
      return next(new ApiError("You are not authorized ...", 401, true));
    }

    if (userName === adminUserName && password === adminPassword) {
      return next();
    }
    return next(new ApiError("Please check ur credentials ...", 400, true));
  } catch (err: any) {
    return next(new ApiError("Server error in adminValidator", 500, false));
  }
};

export const sellerRegisterValidator = [
  check(
    "ownerName",
    "Please Enter a valid owner name which has atlreast 5 charecters"
  )
    .not()
    .isEmpty()
    .isLength({
      min: 5,
    }),
  check(
    "resturentName",
    "Please Enter a valid resturent name which has atlreast 5 charecters"
  )
    .not()
    .isEmpty()
    .isLength({
      min: 5,
    }),
  check("email", "Please enter a valid email ...").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "The password must be greater than 4 digits").isLength({
    min: 5,
  }),
];

export const foodValidator = [
  check("email", "Please enter a valid email ...").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "The password must be greater than 4 digits").isLength({
    min: 5,
  }),
  check(
    "foodName",
    "Please enter a foodName greater than or equal to 3 letters..."
  )
    .isLength({ min: 3 })
    .not()
    .isEmpty(),
];
