/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useNotificationContext } from '@/context/useNotificationContext'
import useQueryParams from '@/hooks/useQueryParams'

const useSignIn = () => {
  const [loading, setLoading] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const { push } = useRouter()
  const { showNotification } = useNotificationContext()

  const queryParams = useQueryParams()

  const loginFormSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
    newPassword: yup.string().optional(),
    confirmPassword: yup.string().optional(),
  })

  const isApi = !!process.env.NEXT_PUBLIC_API_URL

  type LoginFormFields = yup.InferType<typeof loginFormSchema>

  const { control, handleSubmit } = useForm<LoginFormFields>({
    resolver: yupResolver(loginFormSchema),
    defaultValues: {
      email: isApi ? 'admin@entretien.com' : 'user@demo.com',
      password: isApi ? 'password' : '123456',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const login = handleSubmit(async (values: LoginFormFields) => {
    if (mustChangePassword) {
      if (!values.newPassword || !values.confirmPassword) {
        showNotification({ message: 'Veuillez renseigner le nouveau mot de passe et sa confirmation.', variant: 'warning' })
        return
      }
      if (values.newPassword.length < 8) {
        showNotification({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.', variant: 'warning' })
        return
      }
      if (values.newPassword !== values.confirmPassword) {
        showNotification({ message: 'La confirmation du mot de passe est incorrecte.', variant: 'warning' })
        return
      }
    }

    setLoading(true)
    const res = await signIn('credentials', {
      redirect: false,
      email: values?.email,
      password: values?.password,
      ...(mustChangePassword
        ? {
          newPassword: values?.newPassword ?? '',
          confirmPassword: values?.confirmPassword ?? '',
        }
        : {}),
    })

    if (res?.ok) {
      push(queryParams['redirectTo'] ?? '/dashboard/entretien-batiment')
      showNotification({ message: 'Connexion réussie. Redirection en cours...', variant: 'success' })
      setLoading(false)
      return
    }

    if (res?.error === 'PASSWORD_RESET_REQUIRED') {
      setMustChangePassword(true)
      showNotification({
        message: 'Première connexion détectée. Veuillez définir un nouveau mot de passe.',
        variant: 'warning',
      })
      setLoading(false)
      return
    }

    if (res?.error === 'NEW_PASSWORD_TOO_SHORT') {
      showNotification({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.', variant: 'danger' })
      setLoading(false)
      return
    }

    if (res?.error === 'PASSWORD_CONFIRM_MISMATCH') {
      showNotification({ message: 'La confirmation du nouveau mot de passe ne correspond pas.', variant: 'danger' })
      setLoading(false)
      return
    }

    showNotification({ message: res?.error ?? 'Échec de connexion.', variant: 'danger' })
    setLoading(false)
  })

  return { loading, login, control, mustChangePassword }
}

export default useSignIn
