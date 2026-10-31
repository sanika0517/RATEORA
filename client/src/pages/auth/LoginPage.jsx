import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, Store, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_HOME } from '../../utils/constants'
import { getApiError } from '../../utils/formatters'
import { loginSchema } from '../../utils/schemas'

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'demo.admin@rateora.com',
    password: 'Violet7!Orbit42#',
    icon: ShieldCheck,
    tone: 'text-lavender bg-accent/10',
  },
  {
    role: 'Normal User',
    email: 'demo.user@rateora.com',
    password: 'Cyan9@Market!630',
    icon: UserRound,
    tone: 'text-cyan bg-cyan/10',
  },
  {
    role: 'Store Owner',
    email: 'demo.owner@rateora.com',
    password: 'Quartz5#River!28',
    icon: Store,
    tone: 'text-lavender bg-accent/10',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    setValue,
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

  const fillDemoCredentials = (account) => {
    setValue('email', account.email, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setValue('password', account.password, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
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

      <section className="mt-7" aria-labelledby="demo-accounts-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="demo-accounts-heading" className="text-sm font-medium text-ink">
            Explore with a demo account
          </h2>
          <span className="text-[11px] tracking-wide text-muted uppercase">3 roles</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account, index) => {
            const Icon = account.icon
            return (
              <article
                key={account.role}
                className={`rounded-xl border border-line bg-canvas/60 p-3.5 transition-colors hover:border-accent/35 ${
                  index === DEMO_ACCOUNTS.length - 1 ? 'sm:col-span-2' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${account.tone}`}>
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <p className="text-sm font-medium text-ink">{account.role}</p>
                </div>
                <dl className="mt-3 space-y-2 text-xs">
                  <div>
                    <dt className="text-muted">Email</dt>
                    <dd className="mt-0.5 break-all text-ink">{account.email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Password</dt>
                    <dd className="mt-0.5 break-all font-mono text-ink">{account.password}</dd>
                  </div>
                </dl>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="mt-3 w-full border-accent/25 hover:border-accent/50 hover:text-lavender"
                  onClick={() => fillDemoCredentials(account)}
                >
                  Use Demo Account
                </Button>
              </article>
            )
          })}
        </div>
        <p className="mt-2.5 text-xs leading-5 text-muted">
          Credentials fill the form only. Select Sign in to continue.
        </p>
      </section>

      <p className="mt-6 text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="text-ink underline-offset-4 hover:text-lavender hover:underline">
          Create a member account
        </Link>
      </p>
    </div>
  )
}
