import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Show User Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const id = uuidV4()
        const password = await hash("admin", 8)

        await connection.query(
            `INSERT INTO USERS(id, name, email, password, created_at)
          values('${id}', 'admin', 'admin@admin.com.br','${password}' , 'now()')
          `
          )
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to show a profile", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin"
        });

        const { token } = responseToken.body;

        const response = await request(app).get("/api/v1/profile").set({
            Authorization: `Bearer ${token}`,
        });

        expect(response.status).toBe(200);
    });

    it("should not be able to show a user if the token is missing or wrong", async () => {
        const response = await request(app).get("/api/v1/profile").set({
            Authorization: `Bearer 1234`,
        });

        expect(response.status).toBe(401);
    });
});
