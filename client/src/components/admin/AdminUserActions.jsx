import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useState } from 'react'
import Button from '../common/Button'
import ConfirmationDialog from '../common/ConfirmationDialog'
import FormInput from '../common/FormInput'
import FormSelect from '../common/FormSelect'
import FormTextarea from '../common/FormTextarea'
import Modal from '../common/Modal'
import {
  deleteAdminUser,
  resetAdminUserPassword,
  updateAdminUser,
} from '../../services/admin.service'
import { ROLE_OPTIONS } from '../../utils/constants'
import { getApiError } from '../../utils/formatters'
import { resetUserPasswordFormSchema, updateUserSchema } from '../../utils/schemas'

export default function AdminUserActions({ user, currentUserId, onUpdated, onDeleted }) {
  const [mode, setMode] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const editForm = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: '', email: '', address: '', role: '' },
  })
  const passwordForm = useForm({
    resolver: zodResolver(resetUserPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const closeModal = () => setMode(null)

  const openEdit = () => {
    editForm.reset({
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    })
    setMode('edit')
  }

  const openPasswordReset = () => {
    passwordForm.reset({ password: '', confirmPassword: '' })
    setMode('password')
  }

  const submitEdit = async (values) => {
    try {
      const response = await updateAdminUser(user.id, values)
      toast.success(response.message || 'User updated')
      closeModal()
      onUpdated?.()
    } catch (error) {
      toast.error(getApiError(error, 'Unable to update user'))
    }
  }

  const submitPasswordReset = async ({ password }) => {
    try {
      const response = await resetAdminUserPassword(user.id, password)
      toast.success(response.message || 'Password reset')
      closeModal()
    } catch (error) {
      toast.error(getApiError(error, 'Unable to reset password'))
    }
  }

  const confirmDelete = async () => {
    if (user.id === currentUserId || isDeleting) return
    setIsDeleting(true)
    try {
      const response = await deleteAdminUser(user.id)
      toast.success(response.message || 'User deleted')
      closeModal()
      onDeleted?.()
    } catch (error) {
      toast.error(getApiError(error, 'Unable to delete user'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2" onClick={(event) => event.stopPropagation()}>
        <Button type="button" size="sm" variant="secondary" onClick={openEdit}>
          Edit
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={openPasswordReset}>
          Reset password
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={() => setMode('delete')}
          disabled={user.id === currentUserId}
          title={user.id === currentUserId ? 'You cannot delete your own account' : undefined}
        >
          Delete
        </Button>
      </div>

      <Modal
        open={mode === 'edit'}
        title={`Edit ${user.name}`}
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={editForm.handleSubmit(submitEdit)} noValidate>
          <FormInput
            label="Full name"
            placeholder="At least 20 characters"
            error={editForm.formState.errors.name?.message}
            {...editForm.register('name')}
          />
          <FormInput
            label="Email"
            type="email"
            placeholder="user@company.com"
            error={editForm.formState.errors.email?.message}
            {...editForm.register('email')}
          />
          <FormTextarea
            label="Address"
            rows={3}
            placeholder="Up to 400 characters"
            error={editForm.formState.errors.address?.message}
            {...editForm.register('address')}
          />
          <FormSelect
            label="Role"
            error={editForm.formState.errors.role?.message}
            {...editForm.register('role')}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={editForm.formState.isSubmitting}>
              {editForm.formState.isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={mode === 'password'} title="Reset password" onClose={closeModal}>
        <p className="mb-5 text-sm leading-6 text-muted">
          Set a new password for {user.name}. This signs the user out of existing sessions.
        </p>
        <form
          className="space-y-4"
          onSubmit={passwordForm.handleSubmit(submitPasswordReset)}
          noValidate
        >
          <FormInput
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="8–16 characters, one uppercase letter, one special character"
            error={passwordForm.formState.errors.password?.message}
            {...passwordForm.register('password')}
          />
          <FormInput
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? 'Resetting…' : 'Reset password'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={mode === 'delete'}
        title="Delete user account?"
        description={`Delete ${user.name} (${user.email})? Their ratings will also be removed. This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting…' : 'Delete user'}
        onConfirm={confirmDelete}
        onClose={closeModal}
      />
    </>
  )
}
