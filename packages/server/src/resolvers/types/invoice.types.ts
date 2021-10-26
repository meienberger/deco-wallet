/* eslint-disable import/no-cycle */
/* eslint-disable max-classes-per-file */
import { ObjectType, Field, InputType } from 'type-graphql';
import Invoice from '../../entities/Invoice';
import { ErrorResponse } from './error.types';

@ObjectType()
class InvoiceResponse extends ErrorResponse {
  @Field(() => Invoice, { nullable: true })
  invoice?: Invoice;
}

@InputType()
class CreateInvoiceInput {
  @Field({ nullable: false })
  amount!: number;

  @Field({ nullable: false })
  description!: string;
}

enum InvoiceTypeEnum {
  RECEIVE = 'receive',
  SEND = 'send',
}

export { InvoiceResponse, CreateInvoiceInput, InvoiceTypeEnum };
