import { connectDB } from "./configs/db.config.js";
import { env } from "./configs/env.config.js";

import app from "./app.js";

// Server Setup.
async function startServer() {
  try {
    await connectDB();
    app.listen(env.PORT, () =>
      console.log(`server started on PORT: ${env.PORT}`),
    );
  } catch (error) {
    console.error("Failed to start server");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
