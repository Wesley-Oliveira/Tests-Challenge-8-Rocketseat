import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO =
Pick<
  Statement,
  'user_id' |
  'destiny_id' |
  'sender_id' |
  'description' |
  'amount' |
  'type'
>
