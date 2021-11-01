import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type CreateInvoiceInput = {
  amount: Scalars['Float'];
  description: Scalars['String'];
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type Invoice = {
  __typename?: 'Invoice';
  amount: Scalars['Float'];
  confirmedAt?: Maybe<Scalars['DateTime']>;
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  descriptionHash?: Maybe<Scalars['String']>;
  expiresAt: Scalars['DateTime'];
  fee?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  isCanceled: Scalars['Boolean'];
  isConfirmed: Scalars['Boolean'];
  nativeId: Scalars['String'];
  request: Scalars['String'];
  type: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['Float'];
};

export type InvoiceResponse = {
  __typename?: 'InvoiceResponse';
  errors?: Maybe<Array<FieldError>>;
  invoice?: Maybe<Invoice>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createInvoice: InvoiceResponse;
  login: UserResponse;
  logout: Scalars['Boolean'];
  register: UserResponse;
};


export type MutationCreateInvoiceArgs = {
  input: CreateInvoiceInput;
};


export type MutationLoginArgs = {
  input: UsernamePasswordInput;
};


export type MutationRegisterArgs = {
  input: UsernamePasswordInput;
};

export type Query = {
  __typename?: 'Query';
  balance: Scalars['Float'];
  getInvoice: InvoiceResponse;
  invoices: Array<Invoice>;
  me?: Maybe<User>;
  payInvoice: Invoice;
};


export type QueryGetInvoiceArgs = {
  invoiceId: Scalars['Float'];
};


export type QueryPayInvoiceArgs = {
  paymentRequest: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  updatedAt: Scalars['DateTime'];
  username: Scalars['String'];
};

export type UserResponse = {
  __typename?: 'UserResponse';
  errors?: Maybe<Array<FieldError>>;
  user?: Maybe<User>;
};

export type UsernamePasswordInput = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null | undefined };


export const MeDocument = gql`
    query Me {
  me {
    id
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;