import type { Query, QueryKey } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const getQueryData = <
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
>(
  query: Query<TQueryFnData, TError, TData, TQueryKey>,
) => query.state.data;

export const getQueryErrorResponse = <
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = readonly unknown[],
>(
  query: Query<TQueryFnData, TError, TData, TQueryKey>,
) => {
  if (query.state.status === "error") {
    const error = query.state.error;

    if (isAxiosError(error)) {
      return error.response;
    }
  }

  return undefined;
};
