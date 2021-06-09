import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    sender_id,
    amount,
    description,
    type,
    destiny_id
  }: ICreateStatementDTO): Promise<Statement> {
    let statement;
    if (type === 'transfer') {
        statement = this.repository.create({
            user_id,
            sender_id,
            amount,
            description,
            type,
            destiny_id
        });
    }
    else {
        statement = this.repository.create({
            user_id,
            amount,
            description,
            type
        });
    }

    return await this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    >
  {
    const statement = await this.repository.find({where: [{ user_id }, {destiny_id: user_id}]});
    const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'deposit') {
        return acc + Number(operation.amount);
      }
      else if (operation.type === 'transfer')  {
        if (user_id === operation.destiny_id) {
            return acc + Number(operation.amount);
        }
        return acc - Number(operation.amount);
      }
      else {
        return acc - Number(operation.amount);
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }
}
