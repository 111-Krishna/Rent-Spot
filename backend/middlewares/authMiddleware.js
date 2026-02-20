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

  console.log("Token decoded - issuer:", issuer, "kid:", kid);
  console.log("Full claims:", decoded?.payload);

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
  try {
    const clerkId = claims.sub;
    if (!clerkId) {
      console.error("No clerkId in claims");
      return null;
    }

    // First, try to find by clerkId (most reliable)
    const existingUser = await User.findOne({ clerkId }).select("-password");
    if (existingUser) {
      console.log(`User found by clerkId: ${existingUser._id}`);
      return existingUser;
    }

    // Extract email from various possible locations in Clerk claims
    let email = claims.email;
    if (!email && claims.email_verified) {
      // Sometimes email is in email_verified field as an object
      email = claims.email_verified?.email;
    }
    
    // If still no email, generate a unique one based on clerkId
    if (!email) {
      // Use clerkId directly instead of generating, to ensure consistency
      email = `${clerkId}@clerk.local`;
    }

    // Extract name from various possible locations
    let name = claims.name;
    if (!name) {
      name = claims.given_name || claims.family_name || claims.username || "Clerk User";
      if (claims.given_name && claims.family_name) {
        name = `${claims.given_name} ${claims.family_name}`.trim();
      }
    }

    console.log(`Creating new user - clerkId: ${clerkId}, email: ${email}, name: ${name}`);

    try {
      const createdUser = await User.create({
        clerkId,
        name,
        email,
        password: `clerk_${Math.random().toString(36).slice(2, 12)}`,
      });

      console.log(`User created successfully: ${createdUser._id}`);
      return User.findById(createdUser._id).select("-password");
    } catch (createError) {
      // Handle duplicate email error by trying to find existing user
      if (createError.code === 11000 && createError.keyPattern?.email) {
        console.log(`Email already exists (${email}), attempting to find user...`);
        const emailUser = await User.findOne({ email }).select("-password");
        if (emailUser) {
          // Update clerkId if not already set
          if (!emailUser.clerkId) {
            emailUser.clerkId = clerkId;
            await emailUser.save();
            console.log(`Updated existing user with clerkId: ${emailUser._id}`);
          }
          return emailUser;
        }
      }
      throw createError;
    }
  } catch (error) {
    console.error("Error in findOrCreateClerkUser:", error.message);
    console.error("Full error:", error);
    throw error;
  }
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
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, Clerk token failed", error: error.message });
  }
};
