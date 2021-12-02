import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {};
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
  loginSocial: UserResponse;
  logout: Scalars['Boolean'];
  register: UserResponse;
};

export type MutationCreateInvoiceArgs = {
  input: CreateInvoiceInput;
};

export type MutationLoginArgs = {
  input: UsernamePasswordInput;
};

export type MutationLoginSocialArgs = {
  token: Scalars['String'];
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
  firebaseUid?: Maybe<Scalars['String']>;
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

export type LoginSocialMutationVariables = Exact<{
  token: Scalars['String'];
}>;

export type LoginSocialMutation = {
  __typename?: 'Mutation';
  loginSocial: {
    __typename?: 'UserResponse';
    user?: { __typename?: 'User'; id: string } | null | undefined;
    errors?: Array<{ __typename?: 'FieldError'; field: string; message: string }> | null | undefined;
  };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: 'Mutation'; logout: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = { __typename?: 'Query'; me?: { __typename?: 'User'; id: string } | null | undefined };

export const LoginSocialDocument = gql`
  mutation LoginSocial($token: String!) {
    loginSocial(token: $token) {
      user {
        id
      }
      errors {
        field
        message
      }
    }
  }
`;
export type LoginSocialMutationFn = Apollo.MutationFunction<LoginSocialMutation, LoginSocialMutationVariables>;

/**
 * __useLoginSocialMutation__
 *
 * To run a mutation, you first call `useLoginSocialMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginSocialMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginSocialMutation, { data, loading, error }] = useLoginSocialMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useLoginSocialMutation(baseOptions?: Apollo.MutationHookOptions<LoginSocialMutation, LoginSocialMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LoginSocialMutation, LoginSocialMutationVariables>(LoginSocialDocument, options);
}
export type LoginSocialMutationHookResult = ReturnType<typeof useLoginSocialMutation>;
export type LoginSocialMutationResult = Apollo.MutationResult<LoginSocialMutation>;
export type LoginSocialMutationOptions = Apollo.BaseMutationOptions<LoginSocialMutation, LoginSocialMutationVariables>;
export const LogoutDocument = gql`
  mutation Logout {
    logout
  }
`;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
}
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
