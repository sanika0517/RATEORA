import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import FormTextarea from '../../components/common/FormTextarea'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME } from '../../utils/constants'
import { getApiError } from '../../utils/formatters'
import { registerFormSchema } from '../../utils/schemas'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: createAccount } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      email: values.email,
      address: values.address,
      password: values.password,
    }

    try {
      const user = await createAccount(payload)
      toast.success('Account created')
      navigate(ROLE_HOME[user.role] || '/app', { replace: true })
    } catch (error) {
      toast.error(getApiError(error, 'Unable to create your account'))
    }
  }

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-muted uppercase">New member</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Create your RATEORA account</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Public registration is for members. Store owners and admins are created from the admin workspace.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Full name"
          autoComplete="name"
          placeholder="Your full legal name"
          hint="20–60 characters"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormTextarea
          label="Address"
          autoComplete="street-address"
          placeholder="Street, city, and region"
          hint="Maximum 400 characters"
          rows={3}
          error={errors.address?.message}
          {...register('address')}
        />
        <FormInput
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          hint="8–16 characters, one uppercase letter, one special character"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormInput
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-ink underline-offset-4 hover:text-lavender hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
