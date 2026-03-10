/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import TextFormInput from "@/components/form/TextFormInput"
import useSignIn from "../useSignIn"
import PasswordFormInput from "@/components/form/PasswordFormInput"
import Link from "next/link"
import { FormCheck } from "react-bootstrap"

const LoginForm = () => {

  const { login, control, mustChangePassword, loading } = useSignIn()

  return (
    <form action="index.html" className="text-start mb-3" onSubmit={login}>
      <div className="mb-3">
        <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email" id="email-id" placeholder="Entrer votre email" />
      </div>
      <div className="mb-3">
        <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Entrer votre mot de passe"
        id="password-id"
        label='Password'
      />
      </div>
      {mustChangePassword && (
        <>
          <div className="mb-3">
            <PasswordFormInput
              control={control}
              name="newPassword"
              containerClassName="mb-3"
              placeholder="Nouveau mot de passe (min. 8 caractères)"
              id="new-password-id"
              label='Nouveau mot de passe'
            />
          </div>
          <div className="mb-3">
            <PasswordFormInput
              control={control}
              name="confirmPassword"
              containerClassName="mb-3"
              placeholder="Confirmer le nouveau mot de passe"
              id="confirm-password-id"
              label='Confirmer le mot de passe'
            />
          </div>
        </>
      )}
      <div className="d-flex justify-content-between mb-3">
        <div className="form-check">
          {/* <FormCheck className="ps-0" label="Se souvenir de moi" id="sign-in" /> */}
        </div>
        {/* <Link href="/auth/recover-password" className="text-muted border-bottom border-dashed">Mot de passe oublié</Link> */}
      </div>
      <div className="d-grid">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {mustChangePassword ? 'Changer le mot de passe et se connecter' : 'Se connecter'}
        </button>
      </div>
    </form>
  )
}

export default LoginForm
