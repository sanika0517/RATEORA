import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import FormSelect from '../../components/common/FormSelect'
import FormTextarea from '../../components/common/FormTextarea'
import PageHeader from '../../components/common/PageHeader'
import { createAdminUser } from '../../services/admin.service'
import { ROLE_OPTIONS } from '../../utils/constants'
import { getApiError } from '../../utils/formatters'
import { createUserSchema } from '../../utils/schemas'

export default function AddUserPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      password: '',
      role: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      const response = await createAdminUser(values)
      toast.success(response.message || 'User created')
      navigate(`/admin/users/${response.data.id}`)
    } catch (error) {
      toast.error(getApiError(error, 'Unable to create user'))
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Add user"
        description="Create an admin, member, or store owner. Names must be 20–60 characters."
        actions={
          <Button as={Link} to="/admin/users" variant="secondary">
            Back to users
          </Button>
        }
      />

      <form
        className="max-w-xl space-y-4 rounded-2xl border border-line bg-card p-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FormInput
          label="Full name"
          placeholder="At least 20 characters"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormInput
          label="Email"
          type="email"
          placeholder="user@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormTextarea
          label="Address"
          rows={3}
          placeholder="Up to 400 characters"
          error={errors.address?.message}
          {...register('address')}
        />
        <FormSelect label="Role" placeholder="Select a role" error={errors.role?.message} {...register('role')}>
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>
        <FormInput
          label="Temporary password"
          type="password"
          hint="8–16 characters, one uppercase letter, one special character"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create user'}
          </Button>
          <Button as={Link} to="/admin/users" variant="ghost">
            Cancel
          </Button>
        </div>
      </form>
    </section>
  )
}
