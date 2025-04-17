import useSWR from "swr";
import { client } from "~/api/client";

export const useUsers = (id: number | undefined = undefined) => {
  return useSWR(
    ['users', id], () => client.api.users.index.get({ query: { userId: id } })
  );
};