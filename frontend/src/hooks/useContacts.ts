'use client';

import useSWR from "swr";
import { client } from "~/api/client";

export const useUsers = (id: number) => {
  const { data, error, isLoading } = useSWR(['users', id], () => client.api.users.index.get({ query: { userId: id } }));

  console.log(data, error, isLoading);

  return {
    data: data?.data,
    error,
    isLoading,
  };
};
