'use client';

import { client } from "~/api/client";
import { getCookie, setCookie, deleteCookie } from 'cookies-next/client';
import useSWR from "swr";

export const useAuth = () => {
  const token = getCookie('token') as string | undefined;

  const { data, error, isLoading } = useSWR(
    ['auth', token],
    token ? async () => {
      const response = await client.api.auth["verify-token"].get({
        headers: { authorization: token || '' }
      });

      return response;
    } : null
  );

  if (!token) {
    return {
      data: null,
      error: 'No token',
      isLoading: false,
    };
  }

  // Extraer el usuario de la respuesta
  const user = data?.data?.user || null;

  return {
    data: user,
    error: error || (data?.error ? data.error.value?.message : undefined),
    isLoading
  };
};

export const setAuthToken = (token: string) => {
  console.log('Setting auth token:', token);
  setCookie('token', token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    sameSite: 'strict',
  });

  // Verificar que la cookie se haya establecido correctamente
  const savedToken = getCookie('token');
  console.log('Token saved, verification:', savedToken);
};

export const removeAuthToken = () => {
  console.log('Removing auth token');
  deleteCookie('token', { path: '/' });
};
