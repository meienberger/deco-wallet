/* eslint-disable class-methods-use-this */
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import ErrorHelpers from '../../utils/error-helpers';
import { MyContext } from '../../types';
import { CreateInvoiceInput, InvoiceResponse } from './invoice.types';
import InvoiceController from './invoice.controller';
import { isAuth } from '../../middlewares/isAuth';
import { isInvoiceOwner } from '../../middlewares/isInvoiceOwner';
import Invoice from './invoice.entity';

@Resolver()
export default class InvoiceResolver {
  @Mutation(() => InvoiceResponse)
  @UseMiddleware(isAuth)
  async createInvoice(@Arg('input') input: CreateInvoiceInput, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    try {
      const { amount, description } = input;

      const { invoice, errors } = await InvoiceController.createInvoice({ amount, description, userId: req.session.userId || 0 });

      return { invoice, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }

  @Query(() => InvoiceResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isInvoiceOwner)
  async getInvoice(@Arg('invoiceId') invoiceId: number, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    try {
      const { invoice, errors } = await InvoiceController.getInvoiceAndUpdate(invoiceId, req.session.userId || 0);

      return { invoice, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }

  @UseMiddleware(isAuth)
  @Query(() => [Invoice])
  invoices(@Ctx() { req }: MyContext): Promise<Invoice[]> {
    return InvoiceController.getUserInvoices(req.session.userId || 0);
  }

  @UseMiddleware(isAuth)
  @Query(() => Invoice)
  payInvoice(@Arg('paymentRequest') paymentRequest: string, @Ctx() { req }: MyContext): Promise<boolean> {
    return InvoiceController.payInvoice(paymentRequest, req.session.userId || 0);
  }
}
