/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { ReactNode } from 'react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { OffcanvasControlType } from './context'
import { DateClickArg, DropArg } from '@fullcalendar/interaction'
import { EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core/index.js'
import { IconProps } from '@iconify/react'

export type ChildrenType = Readonly<{ children?: ReactNode }>

export type BootstrapVariantType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'

export type FormInputProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  control: Control<TFieldValues>
  name: TName
  id?: string
  containerClassName?: string
  label?: string | ReactNode
  placeholder?: string
  noValidate?: boolean
  labelClassName?: string
}

export type CalendarFormType = {
  isEditable: boolean
  eventData?: EventInput
  onUpdateEvent: (data: any) => void
  onRemoveEvent: () => void
  onAddEvent: (data: any) => void
} & OffcanvasControlType

export type CalendarProps = {
  onDateClick: (arg: DateClickArg) => void
  onEventClick: (arg: EventClickArg) => void
  onDrop: (arg: DropArg) => void
  onEventDrop: (arg: EventDropArg) => void
  events: EventInput[]
}

export type DropzoneFormInputProps = {
  label?: string
  className?: string
  labelClassName?: string
  helpText?: ReactNode | string
  showPreview?: boolean
  iconProps?: IconProps
  text?: string
  textClassName?: string
  onFileUpload?: (files: UploadFileType[]) => void
}


export type UploadFileType = File & {
  path?: string
  preview?: string
  formattedSize?: string
}
