import { check } from "express-validator";

export const requestvalidator = [
  check("userName", "Please Enter a valid userName which has atlreast 5 charecters").not().isEmpty().isLength({
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


