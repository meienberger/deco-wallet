/* eslint-disable class-methods-use-this */
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from '../../types';
import { CreateInvoiceInput, InvoiceResponse, PaginatedInvoicesResponse } from './invoice.types';
import InvoiceController from './invoice.controller';
import Invoice from './invoice.entity';
import PaginationInput from '../common/inputs/pagination.input';

@Resolver()
export default class InvoiceResolver {
  @Authorized()
  @Mutation(() => InvoiceResponse)
  async createInvoice(@Arg('input') input: CreateInvoiceInput, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    const { amount, description } = input;

    const { invoice, errors } = await InvoiceController.createInvoice({ amount, description, userId: req.session.userId || 0 });

    return { invoice, errors };
  }

  @Authorized()
  @Query(() => InvoiceResponse)
  async getInvoice(@Arg('invoiceId') invoiceId: number, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    const { invoice, errors } = await InvoiceController.getInvoiceAndUpdate(invoiceId, req.session.userId || 0);

    return { invoice, errors };
  }

  @Authorized()
  @Query(() => PaginatedInvoicesResponse)
  paginatedInvoices(@Arg('pagination') pagination: PaginationInput, @Ctx() { req }: MyContext): Promise<PaginatedInvoicesResponse> {
    return InvoiceController.getUserInvoices(req.session.userId || 0, pagination);
  }

  @Authorized()
  @Query(() => Invoice)
  payInvoice(@Arg('paymentRequest') paymentRequest: string, @Ctx() { req }: MyContext): Promise<boolean> {
    return InvoiceController.payInvoice(paymentRequest, req.session.userId || 0);
  }
}
