console.log("Authorization header:", req.headers.authorization);

if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
  const token = req.headers.authorization.split(" ")[1];
  console.log("Token received:", token);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded token:", decoded);

  req.user = await User.findById(decoded.id).select("-password");
  console.log("User found:", req.user);

  return next();
}

console.log("No valid token found");
