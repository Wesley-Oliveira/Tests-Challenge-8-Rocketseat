import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
describe("Create User Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to create a new user", async () => {
        const response = await request(app).post("/api/v1/users").send({
            name: "test",
            email: "test@test.com",
            password: "test"
        });

        expect(response.status).toBe(201);
    });

    it("should not be able to create a new user with email already exists", async () => {
        await request(app).post("/api/v1/users").send({
            name: "test",
            email: "test@test.com",
            password: "test"
        });

        const response = await request(app).post("/api/v1/users").send({
            name: "test2",
            email: "test@test.com",
            password: "test2"
        });

        expect(response.status).toBe(400);
    });
});
