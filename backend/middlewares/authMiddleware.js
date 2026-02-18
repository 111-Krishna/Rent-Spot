import jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";
import User from "../models/User.js";

const jwksCacheByIssuer = new Map();

const getClerkJwks = async (issuer) => {
  if (jwksCacheByIssuer.has(issuer)) {
    return jwksCacheByIssuer.get(issuer);
  }

  const response = await fetch(`${issuer}/.well-known/jwks.json`);
  if (!response.ok) {
    throw new Error("Unable to fetch Clerk JWKS");
  }

  const payload = await response.json();
  const keys = payload.keys || [];
  jwksCacheByIssuer.set(issuer, keys);
  return keys;
};

const verifyClerkToken = async (token) => {
  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded?.header?.kid;
  const issuer = decoded?.payload?.iss;

  if (!kid || !issuer) {
    throw new Error("Invalid Clerk token payload/header");
  }

  const keys = await getClerkJwks(issuer);
  const signingKey = keys.find((key) => key.kid === kid);
  if (!signingKey) {
    throw new Error("Signing key not found for Clerk token");
  }

  const publicKey = createPublicKey({
    key: {
      kty: signingKey.kty,
      n: signingKey.n,
      e: signingKey.e,
    },
    format: "jwk",
  });

  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer,
  });
};

const findOrCreateClerkUser = async (claims) => {
  const clerkId = claims.sub;
  if (!clerkId) return null;

  const existingUser = await User.findOne({ clerkId }).select("-password");
  if (existingUser) return existingUser;

  const email = claims.email || `${clerkId}@clerk.local`;
  const name = claims.name || claims.given_name || claims.username || "Clerk User";

  const createdUser = await User.create({
    clerkId,
    name,
    email,
    password: `clerk_${Math.random().toString(36).slice(2, 12)}`,
  });

  return User.findById(createdUser._id).select("-password");
};

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const hasBearerToken = authHeader?.startsWith("Bearer ");

  if (!hasBearerToken) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const claims = await verifyClerkToken(token);
    req.user = await findOrCreateClerkUser(claims);

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, invalid Clerk token" });
    }

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Not authorized, Clerk token failed" });
  }
};
