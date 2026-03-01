/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UsersType } from '@/types/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

// Utilisateurs mock pour le mode sans backend
export const fakeUsers: UsersType[] = [
  {
    id: '1',
    email: 'user@demo.com',
    username: 'demo_user',
    password: '123456',
    firstName: 'Demo',
    lastName: 'User',
    role: 'Admin',
    token: 'mock-token',
  },
]

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email:', type: 'text', placeholder: 'Votre email' },
        password: { label: 'Mot de passe', type: 'password' },
        newPassword: { label: 'Nouveau mot de passe', type: 'password' },
        confirmPassword: { label: 'Confirmation mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        if (API_BASE) {
          // ── Mode API Laravel ──────────────────────────────────────────
          const res = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          }).catch(() => null)

          if (!res || !res.ok) throw new Error('Identifiants incorrects')

          const loginData = await res.json() as {
            token: string
            mustResetPassword?: boolean
            name?: string
            email?: string
          }

          if (loginData.mustResetPassword) {
            const newPassword = (credentials as { newPassword?: string }).newPassword ?? ''
            const confirmPassword = (credentials as { confirmPassword?: string }).confirmPassword ?? ''

            if (!newPassword || !confirmPassword) {
              throw new Error('PASSWORD_RESET_REQUIRED')
            }
            if (newPassword.length < 8) {
              throw new Error('NEW_PASSWORD_TOO_SHORT')
            }
            if (newPassword !== confirmPassword) {
              throw new Error('PASSWORD_CONFIRM_MISMATCH')
            }

            const changePasswordRes = await fetch(`${API_BASE}/api/me/password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${loginData.token}`,
              },
              body: JSON.stringify({
                current_password: credentials.password,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
              }),
            }).catch(() => null)

            if (!changePasswordRes || !changePasswordRes.ok) {
              const err = await changePasswordRes?.json().catch(() => ({}))
              throw new Error((err as { message?: string }).message ?? 'Impossible de modifier le mot de passe')
            }
          }

          return {
            id: '1',
            email: loginData.email ?? credentials.email,
            name: loginData.name ?? credentials.email,
            apiToken: loginData.token,
          }
        }

        // ── Mode mock (sans NEXT_PUBLIC_API_URL) ──────────────────────
        const user = fakeUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )
        if (!user) throw new Error('Email ou mot de passe incorrect')
        return { id: user.id, email: user.email, name: user.username, apiToken: user.token }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  pages: { signIn: '/auth/login' },

  callbacks: {
    // Persiste le token Laravel dans le JWT NextAuth
    async jwt({ token, user }) {
      if (user) token.apiToken = (user as { apiToken?: string }).apiToken ?? ''
      return token
    },
    // Expose le token dans la session côté serveur
    async session({ session, token }) {
      ;(session as { apiToken?: string }).apiToken = (token.apiToken as string) ?? ''
      return session
    },
  },

  session: {
    maxAge: 24 * 60 * 60, // 24 h
  },
}
