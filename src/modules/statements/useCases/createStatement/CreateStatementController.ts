import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { destiny_user_id } = request.params;

    let splittedPath;
    let type;
    if(!destiny_user_id) {
        splittedPath = request.originalUrl.split('/');
        type = splittedPath[splittedPath.length - 1] as OperationType;
    }
    else {
        splittedPath = request.originalUrl.split('/');
        type = splittedPath[splittedPath.length - 2] as OperationType;
    }

    const createStatement = container.resolve(CreateStatementUseCase);
    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
    }, destiny_user_id);

    return response.status(201).json(statement);
  }
}
