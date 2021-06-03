//import { hash } from "bcryptjs";
import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let authUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {

    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        authUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
    });

    it("should be able authenticate an user", async () => {
        const passwordHash = await hash("test", 8);

        const user = await usersRepositoryInMemory.create({
            name: "test",
            email: "test@test.com",
            password: passwordHash
        })

        const auth = await authUserUseCase.execute({
            email: user.email,
            password: "test"
        });

        expect(auth).toHaveProperty("token");
    });

    it("should no be able authenticate an user wih a invalid email", async () => {
        expect(async () => {
            const passwordHash = await hash("test", 8);
            await usersRepositoryInMemory.create({
                name: "test",
                email: "test@test.com",
                password: passwordHash
            })

            const auth = await authUserUseCase.execute({
                email: "testerrado@test.com",
                password: "test"
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
})
