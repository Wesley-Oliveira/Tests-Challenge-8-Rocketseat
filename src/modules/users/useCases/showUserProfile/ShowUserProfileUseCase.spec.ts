import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User", () => {
    beforeEach(() => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
    });

    it("should be able to show a user profile", async () => {
        const user = await usersRepositoryInMemory.create({
            name: "test",
            email: "test@test.com",
            password: "test",
        });

        const profile = await showUserProfileUseCase.execute(user.id as string);

        expect(profile).toHaveProperty("id");
        expect(profile.name).toEqual("test");
    });

    it("should not be able to show an inexistent user profile", async () => {
        expect(async () => {
            await usersRepositoryInMemory.create({
                name: "test",
                email: "test@test.com",
                password: "test",
            });

            await showUserProfileUseCase.execute("123");
        }).rejects.toBeInstanceOf(ShowUserProfileError);
    });
})
