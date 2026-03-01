/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const RecoverPassForm = () => {
  const recoverPassSchema = yup.object({
    email: yup.string().email().required('Please enter your email'),
  })

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(recoverPassSchema),
  })
  return (
    <form action="index.html" className="text-start mb-3" onClick={handleSubmit(()=> {})}>
      <div className="mb-3">
        <TextFormInput control={control} name="email" placeholder="Enter Your Email" label="Email" />
      </div>
      <div className="d-grid">
        <button className="btn btn-primary" type="submit">Reset Password</button>
      </div>
    </form>
  )
}

export default RecoverPassForm