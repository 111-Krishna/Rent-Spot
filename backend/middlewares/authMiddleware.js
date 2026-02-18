import jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";
import User from "../models/User.js";

const CLERK_ISSUER = process.env.CLERK_ISSUER_URL || "https://clerk.dev";
let clerkJwksCache = null;

const getClerkJwks = async () => {
  if (clerkJwksCache) return clerkJwksCache;

  const response = await fetch(`${CLERK_ISSUER}/.well-known/jwks.json`);
  if (!response.ok) {
    throw new Error("Unable to fetch Clerk JWKS");
  }

  const payload = await response.json();
  clerkJwksCache = payload.keys || [];
  return clerkJwksCache;
};

const verifyClerkToken = async (token) => {
  const decoded = jwt.decode(token, { complete: true });
  const kid = decoded?.header?.kid;
  if (!kid) throw new Error("Invalid Clerk token header");

  const keys = await getClerkJwks();
  const signingKey = keys.find((key) => key.kid === kid);
  if (!signingKey) throw new Error("Signing key not found");

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
    issuer: CLERK_ISSUER,
  });
};

const findOrCreateClerkUser = async (claims) => {
  const clerkId = claims.sub;
  if (!clerkId) return null;

  let user = await User.findOne({ clerkId }).select("-password");
  if (user) return user;

  const email = claims.email || `${clerkId}@clerk.local`;
  const name = claims.name || claims.given_name || "Clerk User";

  const created = await User.create({
    clerkId,
    name,
    email,
    password: `clerk_${Math.random().toString(36).slice(2, 12)}`,
  });

  return User.findById(created._id).select("-password");
};

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const hasBearerToken = authHeader && authHeader.startsWith("Bearer");

  if (!hasBearerToken) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (process.env.JWT_SECRET) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    }
  } catch (_error) {
    // Fall back to Clerk token verification.
  }

  try {
    const payload = await verifyClerkToken(token);

    req.user = await findOrCreateClerkUser(payload);

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, invalid Clerk token" });
    }

    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
