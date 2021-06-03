import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {

    beforeEach(() => {
        statementRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementRepositoryInMemory);
    });

    it("should be able to get statement by user id", async () => {
        const passwordHash = await hash("test", 8);

        const user = await usersRepositoryInMemory.create({
            email: "Teste",
            name: "test",
            password: passwordHash
        });

        const statement = await statementRepositoryInMemory.create({
            user_id: user.id as string,
            type: "deposit" as OperationType,
            amount: 1000,
            description: "amount test"
        });

        const response = await getStatementOperationUseCase.execute({
            user_id: user.id as string,
            statement_id: statement.id as string
        });

        expect(response).toHaveProperty("id")
        expect(response.amount).toEqual(1000)
        expect(response.id).toEqual(statement.id)
    });

    it("Should not be able to get statement by user and statement id if user does not exists", async () => {
        expect(async () => {
            const passwordHash = await hash("test", 8);

            const user = await usersRepositoryInMemory.create({
                email: "Teste",
                name: "test",
                password: passwordHash
            });

            const statement = await statementRepositoryInMemory.create({
                user_id: user.id as string,
                type: "deposit" as OperationType,
                amount: 1000,
                description: "amount test"
            });

            await getStatementOperationUseCase.execute({ user_id: "wrong user id", statement_id: statement.id as string })
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    });

    it("Should not be able to get statement by user and statement id if statement does not exists", async () => {
        expect(async () => {
            const passwordHash = await hash("test", 8);

            const user = await usersRepositoryInMemory.create({
                email: "Teste",
                name: "test",
                password: passwordHash
            });

            const statement = await statementRepositoryInMemory.create({
                user_id: user.id as string,
                type: "deposit" as OperationType,
                amount: 1000,
                description: "amount test"
            });

            await getStatementOperationUseCase.execute({ user_id: statement.user_id as string, statement_id: "wrong statement id" })
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    });
})
