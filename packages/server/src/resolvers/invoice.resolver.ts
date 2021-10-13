/* eslint-disable class-methods-use-this */
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import ErrorHelpers from '../controllers/helpers/error-helpers';
import { MyContext } from '../types';
import { CreateInvoiceInput, InvoiceResponse } from './types/invoice.types';
import InvoiceController from '../controllers/invoice.controller';

@Resolver()
export default class InvoiceResolver {
  @Mutation(() => InvoiceResponse)
  async createInvoice(@Arg('input') input: CreateInvoiceInput, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    try {
      const { amount, description } = input;

      if (!req.session.userId) {
        return { errors: [{ field: 'auth', message: 'Not logged in' }] };
      }

      const { invoice, errors } = await InvoiceController.createInvoice({ amount, description, userId: req.session.userId });

      return { invoice, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }

  @Query(() => InvoiceResponse)
  async getInvoice(@Arg('invoiceId') invoiceId: number, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    try {
      if (!req.session.userId) {
        return { errors: [{ field: 'auth', message: 'Not logged in' }] };
      }

      const { invoice, errors } = await InvoiceController.getInvoiceAndUpdate(invoiceId, req.session.userId);

      return { invoice, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }
}
