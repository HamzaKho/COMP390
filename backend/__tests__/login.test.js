const app = require("../server"); // Link to your server file
const supertest = require("supertest");
const request = supertest(app);
const mysql = require("mysql");

it("posts the login endpoint", async (done) => {
  // Sends post Request to /test endpoint
  const res = await request.post("/login").send({
    username: "",
    password: "",
  });
  expect(response.status).toBe(401);
  done();
});
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "comp390",
});
//beforeAll(async () => {});
