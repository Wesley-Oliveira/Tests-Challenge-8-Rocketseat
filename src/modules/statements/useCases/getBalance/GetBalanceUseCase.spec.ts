import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("GetBalance", () => {

    beforeEach(() => {
        statementRepositoryInMemory = new InMemoryStatementsRepository();
        usersRepositoryInMemory = new InMemoryUsersRepository();
        getBalanceUseCase = new GetBalanceUseCase(statementRepositoryInMemory, usersRepositoryInMemory);
    });

    it("should be able to get balance by user id", async () => {
        const passwordHash = await hash("test", 8);

        const user = await usersRepositoryInMemory.create({
            email: "Teste",
            name: "test",
            password: passwordHash
        });

        await statementRepositoryInMemory.create({
            user_id: user.id as string,
            type: "deposit" as OperationType,
            amount: 1000,
            description: "amount test"
        });

        const total =  await getBalanceUseCase.execute({ user_id: user.id as string })

        expect(total.balance).toEqual(1000);
    });

    it("should not be able to get balance by user id if user does not exist", async () => {
        expect(async () => {
            const passwordHash = await hash("test", 8);

            await usersRepositoryInMemory.create({
                email: "Teste",
                name: "test",
                password: passwordHash
            });

            const statement = await statementRepositoryInMemory.create({
                user_id: "123",
                type: "deposit" as OperationType,
                amount: 1000,
                description: "amount test"
            });

            await getBalanceUseCase.execute({ user_id: statement.user_id })
        }).rejects.toBeInstanceOf(GetBalanceError);
    });
})
