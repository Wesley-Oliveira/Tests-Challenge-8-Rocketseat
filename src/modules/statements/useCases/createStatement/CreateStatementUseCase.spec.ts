import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let statementRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {

    beforeEach(() => {
        statementRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementRepositoryInMemory);
    });

    it("should be able to create a statement", async () => {
        const passwordHash = await hash("test", 8);

        const user = await usersRepositoryInMemory.create({
            email: "Teste",
            name: "test",
            password: passwordHash
        });

        const statement = await createStatementUseCase.execute({
            user_id: user.id as string,
            type: "deposit" as OperationType,
            amount: 1000,
            description: "amount test"
        });

        expect(statement).toHaveProperty("id");
        expect(statement.user_id).toEqual(user.id);
    });

    it("should not be able to create a statement without a valid user", async () => {
        expect(async () => {
            const passwordHash = await hash("test", 8);

            const user = await usersRepositoryInMemory.create({
                email: "Teste",
                name: "test",
                password: passwordHash
            });

            await createStatementUseCase.execute({
                user_id: "123",
                type: "deposit" as OperationType,
                amount: 1000,
                description: "amount test"
            });
        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    });

    it("should not be able to create a statement if balance is lower than the withdraw", async () => {
        expect(async () => {
            const passwordHash = await hash("test", 8);

            const user = await usersRepositoryInMemory.create({
                email: "Teste",
                name: "test",
                password: passwordHash
            });

            await createStatementUseCase.execute({
                user_id: user.id as string,
                type: "deposit" as OperationType,
                amount: 1000,
                description: "amount test"
            });

            await createStatementUseCase.execute({
                user_id: user.id as string,
                type: "withdraw" as OperationType,
                amount: 1500,
                description: "amount test"
            });
        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    });
})
