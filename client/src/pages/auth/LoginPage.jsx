import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME } from '../../utils/constants'
import { getApiError } from '../../utils/formatters'
import { loginSchema } from '../../utils/schemas'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      const user = await login(values)
      toast.success('Signed in')
      navigate(ROLE_HOME[user.role] || '/', { replace: true })
    } catch (error) {
      toast.error(getApiError(error, 'Unable to sign in'))
    }
  }

  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-muted uppercase">Welcome back</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Sign in to RATEORA</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Use your workspace credentials. You will land on the dashboard for your role.
      </p>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormInput
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="text-ink underline-offset-4 hover:text-lavender hover:underline">
          Create a member account
        </Link>
      </p>
    </div>
  )
}
