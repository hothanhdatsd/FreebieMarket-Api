import bcrypt from "bcryptjs";
const users = [
  {
    name: "Admin User",
    email: "admin@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    name: "Nguyen Van A",
    email: "nguyenvana@example.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "Nguyen Van B",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvanb@example.com",
  },
  {
    name: "Nguyen Van C",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvanc@example.com",
  },
  {
    name: "Nguyen Van L",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvanl@example.com",
  },
  {
    name: "Nguyen Van D",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvand@example.com",
  },
  {
    name: "Nguyen Van E",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvane@example.com",
  },
  {
    name: "Nguyen Van O",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvano@example.com",
  },
  {
    name: "Nguyen Van G",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvang@example.com",
  },
  {
    name: "Nguyen Van H",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvanh@example.com",
  },
  {
    name: "Nguyen Van I",
    password: bcrypt.hashSync("123456", 10),
    email: "nguyenvani@example.com",
  },
];

export default users;
