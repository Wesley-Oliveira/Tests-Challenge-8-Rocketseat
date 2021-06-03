import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository;
        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    })

    it("should be able to create a new user", async () => {
        const user = await createUserUseCase.execute({
            name: "Teste",
            email: "teste@test.com",
            password: "teste"
        });

        expect(user).toHaveProperty("id");
    });

    it("should not be able to create a new user with an existent email", async () => {

        expect(async () => {
            await createUserUseCase.execute({
                name: "Teste",
                email: "teste@test.com",
                password: "teste"
            });

            await createUserUseCase.execute({
                name: "Teste",
                email: "teste@test.com",
                password: "teste"
            });
        }).rejects.toBeInstanceOf(CreateUserError);
    });
})
