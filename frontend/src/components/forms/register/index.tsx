'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { client } from '~/api/client';
import { setAuthToken } from '~/hooks/auth';
import { registerOpts, registerSchema } from '~/components/forms/register/options';
import { useAppForm } from '~/components/ui/form';
import { getCookie } from 'cookies-next/client';

export function Form() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useAppForm({
    ...registerOpts,
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async (form) => {
      const { email, password } = form.value;
      const { data, error } = await client.api.auth.register.post({ username: email, password: password });
      if (error || !data.success) {
        setError(error?.value.message ?? data?.message ?? 'Unknown error');
      } else {
        setError(null);
        if (data.data?.token) {
          console.log('Registration successful, setting token:', data.data.token);
          setAuthToken(data.data.token);

          // Verificar que el token se haya establecido correctamente
          const savedToken = getCookie('token', { httpOnly: false });
          console.log('Token saved, verification:', savedToken);

          if (savedToken) {
            router.push('/'); // '/' is the chats page
          } else {
            setError('Failed to save authentication token');
          }
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  return (
    <form
      onSubmit={ handleSubmit }
      className='flex flex-col gap-4 border-2 border-neutral-200 justify-center w-96 p-12 rounded-md'
    >
      <form.AppField name='email'>
        { field => (
          <field.FormItem>
            <field.FormLabel>Email</field.FormLabel>
            <field.FormInput placeholder='Email' />
            <field.FormMessage />
          </field.FormItem>
        ) }
      </form.AppField>
      <form.AppField name='password'>
        { field => (
          <field.FormItem>
            <field.FormLabel>Password</field.FormLabel>
            <field.FormInput placeholder='Password' type='password' />
            <field.FormMessage />
          </field.FormItem>
        ) }
      </form.AppField>
      <form.AppField name='confirmPassword'>
        { field => (
          <field.FormItem>
            <field.FormLabel>Confirm Password</field.FormLabel>
            <field.FormInput placeholder='Confirm Password' type='password' />
            <field.FormMessage />
          </field.FormItem>
        ) }
      </form.AppField>
      { error && <p className='text-red-500 text-sm'>{ error }</p> }
      <form.AppForm>
        <form.Submit label='Register' />
      </form.AppForm>
      <p className='text-sm text-neutral-400'>Already have an account? <Link href='/login' className='text-neutral-600'>Login</Link></p>
    </form>
  );
}
