/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'


const ConfirmMailForm = () => {

  const registerSchema = yup.object({
    code: yup.string().required('Please enter 6 Digit Code'),
  })

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(registerSchema),
  })

  return (
    <>
      <form action="/dashboard/sales" className="text-start mb-3" onClick={handleSubmit(() => { })}>
        <div className="mb-3">
          <TextFormInput control={control} name="code" placeholder="CODE" label="Enter 6 Digit Code" />
        </div>
        <div className="mb-3 d-grid">
          <button className="btn btn-primary" type="submit">Continue</button>
        </div>
        <p className="mb-0 text-center">Don&apos;t received code yet? <Link href="" className="link-primary fw-semibold text-decoration-underline">Send Again</Link></p>
      </form>
    </>
  )
}

export default ConfirmMailForm