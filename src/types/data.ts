/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { StaticImageData } from "next/image"
import { BootstrapVariantType } from "./component-props"
import { ApexOptions } from "apexcharts"


export type IdType = string

export type BrandListType = {
  id: IdType
  name: string
  category: string
  image: StaticImageData
  since: number
  Stores: string
  products: string
}

export type OrderType = {
  id: IdType
  userId: SocialUserType['id']
  users?: SocialUserType
  product: {
    p1: string
    p2?: string
  }
  quantity: {
    p1: number
    p2?: number
  }
  total: number
  date: Date
  paymentStatus: 'Completed' | 'Pending' | 'Failed'
  orderStatus: 'Delivered' | 'Cancel' | 'Ready To Pick' | 'Dispatched'
}

export type DoctorsType = {
  id: IdType
  name: string
  image: StaticImageData
  position: string
  rating: {
    star: number,
    review: number
  }
}

export type AppointmentType = {
  id: IdType
  name: string
  gender: 'Male' | 'female'
  age: number
  appointment: string
  date: Date
  doctorsId: DoctorsType['id']
  doctors?: DoctorsType
  appointmentStatus: 'Completed' | 'Scheduled' | 'Canceled'
  phone: string
  department: string
  reasonVisit: string
}

export type TransactionType = {
  id: IdType
  businessName: string
  image?: StaticImageData
  description: string
  amount: string
  date: Date
  variant?: string
  paymentType?: 'Credit' | 'Debit'
  paymentImage: StaticImageData
  paymentMethod: string
  paymentStatus: 'Success' | 'Failed' | 'Onhold'
}

export type UserType = {
  id: IdType
  name: string
  image?: StaticImageData
  date: Date
  email: string
  allMessage?: boolean
  message: string
  iconColor?: string
  voiceMessage?: boolean
  unRead?: number
  sendMessage?: boolean
  activeOffline?: 'Active' | 'Offline' | 'Typing,,,,'
  isSend?: boolean
  icon?: string
}

export type FileType = Partial<File> & {
  preview?: string
}

export type ChatMessageType = {
  id: IdType
  from: UserType
  to: UserType
  message: {
    type: 'file' | 'text'
    value: FileType[] | string
  }
  sentOn?: Date
}

export type ActivityType = {
  title: string
  icon?: string
  variant?: BootstrapVariantType
  status?: 'completed' | 'latest'
  files?: FileType[]
  time: Date
  type?: 'task' | 'design' | 'achievement'
  content?: string
}

export type SocialEventType = {
  id: IdType
  title: string
  venue: string
  type: 'togetherness' | 'celebration' | 'professional'
  image: StaticImageData
  startsAt: Date
}

export type FilesType = {
  id: IdType
  icon: string
  title: string
  fileVariant: string
  file: string
  date: Date
  userId: SocialUserType['id']
  user?: SocialUserType
  size: number
  members: {
    text: string,
    variant: string
  }[]
}

export type SocialUserType = {
  id: IdType
  name: string
  email: string
  image: StaticImageData
  phone: string
  BirthDate: string
}

export type DoctorListType = {
  id: IdType
  name: string
  image: StaticImageData
  specialty: string
  number: string
  position: string
  specialNotes: string
  email: string
  timing: string
  location: string
  locationKm: string
  ratingStar: number
  experience: number
}

export type PatientsType = {
  id: IdType
  gender: 'Male' | 'Female'
  userId: SocialUserType['id']
  user?: SocialUserType
  bloodGroup: string
  address: string
  physician: string
}

export type PaymentType = {
  id: IdType
  insuranceComp: string
  billDate: Date
  userId: SocialUserType['id']
  user?: SocialUserType
  doctorsId: DoctorsType['id']
  doctors?: DoctorsType
  charge: number
  tax: number
  discount: number
  total: number
}

export type DepartmentType = {
  id: IdType
  image: StaticImageData
  title: string
  description: string
  rating: {
    star: number,
    review: number
  }
  bestDoctor: {
    name: string,
    image?: StaticImageData
    textVariant?: string
    variant?: string
  }[]
}

export type ReviewType = {
  id: IdType
  doctorsId: DoctorListType['id']
  doctors?: DoctorListType
  rating: {
    star: number
    review: number
  }
  reviews: {
    name: string
    star: number
    description: string
    like: number
    dislike: number
    date: Date
  }[]
}

export type ProductType = {
  id: IdType
  name: string
  image: StaticImageData
  description: string
  date: Date
  price: number
  quantity: number
  brand: string[]
  averagePriceMin: number  
  averagePriceMax:  number
  sellingItems: string[]
  discountsAvailable: string
  category: string
  status: 'Active' | 'Inactive'
  productName: string
  discountPrice: number
  size: string
  rating: {
    star: number
    review: number
  }
  isDeal?: boolean
  isSeal?: boolean 
}

export type CustomersType = {
  id: IdType
  userId: SocialUserType['id']
  users?: SocialUserType
  status: 'Active' | 'Block'
  shopRate: number  
  invoice: string
  totalAmount: number
  amountDue: number
  dueDate: Date
}

export type SellersType = {
  id: IdType
  title: string
  image: StaticImageData
  rating: {
    star: number
    review: number
  }
  description: string
  location: string
  email: string
  stock: string
  sells: number
  series: ApexOptions['series'] 
  brand: string
  revenue: string
}

export type InvoicesType = {
  id: IdType
  userId: SocialUserType['id']
  users?: SocialUserType
  productId: ProductType['id']
  products?: ProductType
  amount: string
  date: Date
  invoicesStatus: 'Paid' | 'Cancelled' | 'Pending'
}

export type Employee = {
  id: IdType
  name: string
  email: string
  position: string
  company: string
  country: string
  office: string
  age: number
  startDate: string
  salary: string
}

export type EmailLabelType = 'Primary' | 'Social' | 'Promotions' | 'Updates' | 'Forums'

export type EmailType = {
  id: IdType
  isStar?: boolean
  image : StaticImageData
  name: string
  subTitle: string
  description: string
  IsAttachment?: number
  date: Date
  variant?: string
}
