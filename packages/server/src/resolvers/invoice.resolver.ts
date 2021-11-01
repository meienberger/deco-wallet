/* eslint-disable class-methods-use-this */
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import ErrorHelpers from '../controllers/helpers/error-helpers';
import { MyContext } from '../types';
import { CreateInvoiceInput, InvoiceResponse } from './types/invoice.types';
import InvoiceController from '../controllers/invoice.controller';
import { isAuth } from '../middlewares/isAuth';
import { isInvoiceOwner } from '../middlewares/isInvoiceOwner';

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
}
