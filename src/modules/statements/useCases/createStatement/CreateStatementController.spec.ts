import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create statement", () => {
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

    it("Should be able to create a deposit statement", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin"
        });

        const { token } = responseToken.body

        const response = await request(app).post('/api/v1/statements/deposit').send({
            amount: 10,
            description: "Test"
        }).set({
            Authorization: `Bearer ${token}`
        });

        expect(response.statusCode).toEqual(201)
    });

    it("Should be able to create a withdraw statement", async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: "admin@admin.com.br",
            password: "admin"
        })

        const { token } = responseToken.body

        const response = await request(app).post('/api/v1/statements/withdraw').send({
          amount: 5,
          description: "Test"
        }).set({
          Authorization: `Bearer ${token}`
        })
        expect(response.statusCode).toEqual(201)
        expect(response.body).toHaveProperty("id")
    });

    it("should not be able to create a statement if balance is lower than the withdraw", async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: "admin@admin.com.br",
            password: "admin"
        })

        const { token } = responseToken.body

        const response = await request(app).post('/api/v1/statements/withdraw').send({
            amount: 5000,
            description: "Test"
        }).set({
            Authorization: `Bearer ${token}`
        })

        expect(response.status).toEqual(400);
    });

    it("should not be able to create a statement without a valid user", async () => {
        const responseToken = await request(app).post('/api/v1/sessions').send({
            email: "admin@admin.com.br",
            password: "admin"
        })

        const response = await request(app).post('/api/v1/statements/deposit').send({
            amount: 5000,
            description: "Test"
        }).set({
            Authorization: `Baerer 1234`
        })

        expect(response.status).toEqual(401);
    });
})
