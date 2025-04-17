'use client';

import useSWR from 'swr';
import { client } from '~/api/client';

export const useContact = (userId: number) => {

  const { data, error, isLoading } = useSWR(
    ['contact', userId],
    async () => {
      const api = await client.api.users({ userId }).get();

      if (!api.data || api.error) {
        throw new Error('Failed to fetch user data');
      }

      console.log(api);

      return api;
    }
  );

  return {
    data,
    error,
    isLoading
  };
};
