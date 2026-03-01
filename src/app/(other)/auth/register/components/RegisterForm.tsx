/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const RegisterForm = () => {

  const registerSchema = yup.object({
    name: yup.string().required('Please enter your Name'),
    email: yup.string().email().required('Please enter your email'),
    password: yup.string().required('Please enter your Password'),
  })

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(registerSchema),
  })

  return (
    <>
      <form action="index.html" className="text-start mb-3" onSubmit={handleSubmit(() => {})}>
        <div className="mb-3">
          <TextFormInput control={control} name="name" placeholder="Enter Your Name" label="Your Name" />
        </div>
        <div className="mb-3">
          <TextFormInput control={control} name="email" placeholder="Enter Your email" label="Email" />
        </div>
        <div className="mb-3">
          <TextFormInput control={control} name="password" placeholder="Enter Your Password" label="Password" />
        </div>
        <div className="d-flex justify-content-between mb-3">
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id="checkbox-signin" />
            <label className="form-check-label" htmlFor="checkbox-signin">I agree to all <Link href="" className="link-dark text-decoration-underline">Terms &amp; Condition</Link> </label>
          </div>
        </div>
        <div className="d-grid">
          <button className="btn btn-primary" type="submit">Sign Up</button>
        </div>
      </form>
    </>
  )
}

export default RegisterForm