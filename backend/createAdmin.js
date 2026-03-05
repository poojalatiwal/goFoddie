const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoURI = "mongodb+srv://pooja:pooja123@cluster0.cyhi7qx.mongodb.net/goFood?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
  process.exit(1);
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  location: String,
  role: String,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists!");
      mongoose.connection.close();
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = new User({
      name: "Admin ",
      email: "admin@gmail.com",
      password: hashedPassword,
      location: "Head Office",
      role: "admin"
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
