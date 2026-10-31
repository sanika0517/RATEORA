import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FormInput from '../../components/common/FormInput'
import FormSelect from '../../components/common/FormSelect'
import FormTextarea from '../../components/common/FormTextarea'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import PageHeader from '../../components/common/PageHeader'
import { createAdminStore, getAdminStores, getAdminUsers } from '../../services/admin.service'
import { ROLES } from '../../utils/constants'
import { getApiError } from '../../utils/formatters'
import { createStoreSchema } from '../../utils/schemas'

export default function AddStorePage() {
  const navigate = useNavigate()
  const [owners, setOwners] = useState([])
  const [loadingOwners, setLoadingOwners] = useState(true)
  const [ownerError, setOwnerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      ownerId: '',
    },
  })

  const loadOwners = async () => {
    setLoadingOwners(true)
    setOwnerError('')

    try {
      const [usersResponse, storesResponse] = await Promise.all([
        getAdminUsers({
          role: ROLES.STORE_OWNER,
          sortBy: 'name',
          order: 'asc',
          page: 1,
          limit: 100,
        }),
        getAdminStores({ sortBy: 'name', order: 'asc', page: 1, limit: 100 }),
      ])

      const assigned = new Set(
        (storesResponse.data.stores || []).map((store) => store.owner?.id).filter(Boolean)
      )
      setOwners((usersResponse.data.users || []).filter((user) => !assigned.has(user.id)))
    } catch (err) {
      setOwnerError(getApiError(err, 'Unable to load store owners'))
    } finally {
      setLoadingOwners(false)
    }
  }

  useEffect(() => {
    loadOwners()
  }, [])

  const onSubmit = async (values) => {
    try {
      const response = await createAdminStore(values)
      toast.success(response.message || 'Store created')
      navigate('/admin/stores')
    } catch (error) {
      toast.error(getApiError(error, 'Unable to create store'))
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Add store"
        description="Assign a new store to an existing store owner who does not already have one."
        actions={
          <Button as={Link} to="/admin/stores" variant="secondary">
            Back to stores
          </Button>
        }
      />

      {loadingOwners ? (
        <LoadingSpinner label="Loading owners" />
      ) : ownerError ? (
        <ErrorState description={ownerError} onRetry={loadOwners} />
      ) : owners.length === 0 ? (
        <EmptyState
          title="No available store owners"
          description="Create a store owner account first. Each owner can be assigned only one store."
          action={
            <Button as={Link} to="/admin/users/new">
              Add store owner
            </Button>
          }
        />
      ) : (
        <form
          className="max-w-xl space-y-4 rounded-2xl border border-line bg-card p-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <FormInput
            label="Store name"
            placeholder="At least 20 characters"
            error={errors.name?.message}
            {...register('name')}
          />
          <FormInput
            label="Store email"
            type="email"
            placeholder="store@company.com"
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
          <FormSelect
            label="Store owner"
            placeholder="Select an owner"
            hint="Only owners without an assigned store are listed."
            error={errors.ownerId?.message}
            {...register('ownerId')}
          >
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} · {owner.email}
              </option>
            ))}
          </FormSelect>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create store'}
            </Button>
            <Button as={Link} to="/admin/stores" variant="ghost">
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
