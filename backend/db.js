const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Create or update admin user with hashed password
    await createOrUpdateAdminUser();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const createOrUpdateAdminUser = async () => {
  try {
    const username = process.env.ADMIN_USERNAME || "admin";

    // Get the password hash from environment
    let hashedPassword;

    if (process.env.ADMIN_PASSWORD_HASH) {
      // Use pre-hashed password (recommended)
      hashedPassword = process.env.ADMIN_PASSWORD_HASH;
    } else if (process.env.ADMIN_PASSWORD) {
      // Fallback to plain password (not recommended for production)
      console.warn(
        "⚠️  WARNING: Using plain text password. Consider using ADMIN_PASSWORD_HASH instead!",
      );
      hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    } else {
      console.error("❌ ERROR: No admin password provided!");
      console.error(
        "   Set either ADMIN_PASSWORD_HASH or ADMIN_PASSWORD in .env file",
      );
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // User exists - check if password hash needs updating
      if (existingUser.password !== hashedPassword) {
        // Password hash in .env is different from database - update it
        existingUser.password = hashedPassword;
        await existingUser.save();
        console.log(`✅ Admin password updated from .env file`);
        console.log(`   Username: ${username}`);
        console.log(`   Password: (synced with .env hash)`);
      } else {
        // Password is already in sync
        console.log(`ℹ️  Admin user already exists with current password`);
      }
    } else {
      // User doesn't exist - create new admin user
      await User.create({
        username,
        password: hashedPassword,
      });

      console.log(`✅ Admin user created successfully`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: (securely hashed)`);
    }
  } catch (error) {
    console.error("❌ Error managing admin user:", error);
  }
};

module.exports = connectDB;
