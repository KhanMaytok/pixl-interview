import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import {
	createFormHook,
	createFormHookContexts,
	useStore,
} from '@tanstack/react-form';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/lib/utils';

const {
	fieldContext,
	formContext,
	useFieldContext: _useFieldContext,
	useFormContext,
} = createFormHookContexts();

const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		FormLabel,
		FormControl,
		FormDescription,
		FormMessage,
		FormItem,
		FormInput,
		FormInputArea,
	},
	formComponents: {
		Submit,
	},
});

type FormItemContextValue = {
	id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue
);

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<div
				data-slot='form-item'
				className={cn('grid gap-2', className)}
				{...props}
			/>
		</FormItemContext.Provider>
	);
}

const useFieldContext = () => {
	const { id } = React.useContext(FormItemContext);
	const { name, store, ...fieldContext } = _useFieldContext();

	const errors = useStore(store, state => state.meta.errors);
	if (!fieldContext) {
		throw new Error('useFieldContext should be used within <FormItem>');
	}

	return {
		id,
		name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		errors,
		store,
		...fieldContext,
	};
};

function FormLabel({
	className,
	...props
}: React.ComponentProps<typeof Label>) {
	const { formItemId, errors } = useFieldContext();

	return (
		<Label
			data-slot='form-label'
			data-error={!!errors.length}
			className={cn('data-[error=true]:text-destructive', className)}
			htmlFor={formItemId}
			{...props}
		/>
	);
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
	const { errors, formItemId, formDescriptionId, formMessageId } =
		useFieldContext();

	return (
		<Slot
			data-slot='form-control'
			id={formItemId}
			aria-describedby={
				!errors.length
					? `${formDescriptionId}`
					: `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={!!errors.length}
			{...props}
		/>
	);
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
	const { formDescriptionId } = useFieldContext();

	return (
		<p
			data-slot='form-description'
			id={formDescriptionId}
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	);
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
	const { errors, formMessageId } = useFieldContext();
	const body = errors.length
		? String(errors.at(0)?.message ?? '')
		: props.children;
	if (!body) return null;

	return (
		<p
			data-slot='form-message'
			id={formMessageId}
			className={cn('text-destructive text-sm', className)}
			{...props}
		>
			{body}
		</p>
	);
}

function Submit({ label }: { label: string }) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={state => state.isSubmitting}>
			{isSubmitting => <Button disabled={isSubmitting}> {label} </Button>}
		</form.Subscribe>
	);
}

export default function FormInput(
	props: React.InputHTMLAttributes<HTMLInputElement>
) {
	const field = _useFieldContext<string>();

	return (
		<Input
			value={field.state.value}
			onChange={e => field.handleChange(e.target.value)}
			onBlur={() => field.handleBlur()}
			{...props}
		/>
	);
}

export function FormInputArea(
	props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
	const field = _useFieldContext<string>();

	return (
		<Textarea
			value={field.state.value}
			onChange={e => field.handleChange(e.target.value)}
			onBlur={() => field.handleBlur()}
			{...props}
		/>
	);
}

export { useAppForm, useFormContext, useFieldContext, withForm };
