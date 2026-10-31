import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import PageHeader from '../../components/common/PageHeader'
import { useAuth } from '../../hooks/useAuth'
import { getApiError } from '../../utils/formatters'
import { changePasswordFormSchema } from '../../utils/schemas'

export default function ProfilePage() {
  const { user, updatePassword } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      const payload = await updatePassword({ currentPassword, newPassword })
      toast.success(payload.message || 'Password updated. Please sign in again.')
      reset()
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(getApiError(error, 'Unable to update password'))
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Profile"
        description="Account details from your current session. Changing your password signs you out everywhere."
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-2xl border border-line bg-card p-6">
          <p className="text-sm font-medium text-ink">Account</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="mt-1 text-ink">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 text-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-2">
                <Badge role={user?.role} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">Address</dt>
              <dd className="mt-1 leading-6 text-ink">{user?.address || '—'}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-line bg-card p-6">
          <p className="text-sm font-medium text-ink">Change password</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            After a successful change, your current session is revoked and you will need to sign in again.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput
              label="Current password"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <FormInput
              label="New password"
              type="password"
              autoComplete="new-password"
              hint="8–16 characters, one uppercase letter, one special character"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <FormInput
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </article>
      </div>
    </section>
  )
}
