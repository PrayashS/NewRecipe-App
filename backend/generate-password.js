const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the password you want to hash: ", async (password) => {
  if (!password || password.trim() === "") {
    console.log("❌ Password cannot be empty");
    rl.close();
    return;
  }

  try {
    // Generate hash with salt rounds of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("\n✅ Password hashed successfully!\n");
    console.log("Copy this hash and paste it in your .env file:\n");
    console.log("ADMIN_PASSWORD_HASH=" + hashedPassword);
    console.log(
      "\nMake sure to remove the plain ADMIN_PASSWORD line from .env\n",
    );
  } catch (error) {
    console.error("❌ Error hashing password:", error);
  }

  rl.close();
});
