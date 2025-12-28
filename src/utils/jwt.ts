import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  role: "admin" | "user" | "seller";
}

// This is the code for Access Token
export const generateAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};

// This is the code for Refresh Token
export const generateRefreshToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};
