import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
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

    it("should be able to authenticate a user", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin"
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
    });

    it("should not be able to authenticate a user if the password is wrong", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin wrong"
        });

        expect(response.status).toBe(401);
    });


    it("should not be able to authenticate a user if the email is wrong", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: "worng admin@admin.com.br",
            password: "admin"
        });

        expect(response.status).toBe(401);
    });
});
