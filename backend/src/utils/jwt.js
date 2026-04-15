import jwt from "jsonwebtoken";
import { Env } from "../config/env.config.js";

const defaults = {
  audience: ["user"],
};

const accessTokenSignOptions = {
  expiresIn: Env.JWT_EXPIRES_IN,
  secret: Env.JWT_SECRET,
};

export const signJwtToken = (
  payload,
  options
) => {
  const isAccessToken = !options || options === accessTokenSignOptions;

  const { secret, ...opts } = options || accessTokenSignOptions;

  const token = jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });

  const decoded = jwt.decode(token);
  const expiresAt = isAccessToken
    ? decoded?.exp * 1000
    : undefined;

  return {
    token,
    expiresAt,
  };
};
