import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({statement, balance}: { statement: Statement[], balance: number}) {
    const parsedStatement = statement.map(({
        id,
        amount,
        description,
        type,
        created_at,
        updated_at,
        sender_id,
        destiny_id
      }) =>
      ({
          id,
          amount: Number(amount),
          description,
          type,
          created_at,
          updated_at,
          sender_id,
          destiny_id
       })
      );

    parsedStatement.forEach(parsed_statement => {
        if (!parsed_statement.sender_id) {
            delete parsed_statement.sender_id;
        }
        delete parsed_statement.destiny_id
    });

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
