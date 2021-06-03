import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("GetBalance", () => {
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

    it("Should be able to get balance", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin"
        });

        const { token } = responseToken.body

        await request(app).post('/api/v1/statements/deposit').send({
            amount: 10,
            description: "Test"
        }).set({
            Authorization: `Bearer ${token}`
        });

        const response = await request(app).get('/api/v1/statements/balance').set({
            Authorization: `Bearer ${token}`
        });

        expect(response.statusCode).toEqual(200);
        expect(response.body.statement.length).toEqual(1);
        expect(response.body.statement[0].type).toEqual("deposit");
    });
})
