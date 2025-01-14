import Admin from "../models/admin.model.js";
import bcryptjs from "bcryptjs";

const saltRounds = 12;

const admins = [
  {
    username: "roshan234",
    email: "roshan@example.com",
    password: "password123",
  },
  {
    username: "dinusha567",
    email: "dinusha@example.com",
    password: "password456",
  },
  {
    username: "janaka890",
    email: "janaka@example.com",
    password: "password789",
  },
  {
    username: "tharushi234",
    email: "tharushi@example.com",
    password: "password234",
  },
  {
    username: "isuru567",
    email: "isuru@example.com",
    password: "password567",
  },
];

const populateAdmins = async () => {
  try {
    for (const admin of admins) {
      const hashedPassword = await bcryptjs.hash(admin.password, saltRounds);
      const newAdmin = new Admin({ ...admin, password: hashedPassword });
      await newAdmin.save();
    }
    console.log("Admins successfully populated");
  } catch (error) {
    console.error("Error populating admins:", error);
  }
};

export default populateAdmins;
