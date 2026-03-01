// /* Konrad Ahodan : konrad.ahodan@approbations.ca */
// import { appointmentsData, brandListData, customersData, dataTableRecords, departmentData, doctorListData, doctorsData, filesData, invoicesData, patientsData, paymentData, reviewData, sellersData, socialUserData, transactionData, userData } from "@/assets/data/other"
// import { AppointmentType, BrandListType, CustomersType, DepartmentType, DoctorListType, DoctorsType, EmailType, Employee, FilesType, InvoicesType, OrderType, PatientsType, PaymentType, ProductType, ReviewType, SellersType, TransactionType, UserType } from "@/types/data"

// const orderData: OrderType[] = []
// const productData: ProductType[] = []
// const emailsData: EmailType[] = []
// import { sleep } from "@/utils/promise"


// export const getProducts = async (): Promise<ProductType[]> => {
//   await sleep()
//   return productData
// }

// export const getBrandsList = async (): Promise<BrandListType[]> => {
//   await sleep()
//   return brandListData
// }

// export const getAllUsers = async (): Promise<UserType[]> => {
//   return userData
// }

// export const getAllDoctors = async (): Promise<DoctorsType[]> => {
//   await sleep()
//   return doctorsData
// }

// export const getAllDoctorList = async (): Promise<DoctorListType[]> => {
//   await sleep()
//   return doctorListData
// }

// export const getAllSellers = async (): Promise<SellersType[]> => {
//   await sleep()
//   return sellersData
// }

// export const getAllDepartments = async (): Promise<DepartmentType[]> => {
//   await sleep()
//   return departmentData
// }

// export const getAllDataTableRecords = async (): Promise<Employee[]> => {
//   await sleep()
//   return dataTableRecords
// }



// export const getAllTransaction = async (): Promise<TransactionType[]> => {
//   await sleep()
//   return transactionData
// }

// export const getAllEmails = async (): Promise<EmailType[]> => {
//   await sleep()
//   return emailsData
// }

// export const getAllAppointment = async (): Promise<AppointmentType[]> => {
//   const data = appointmentsData.map((item) => {
//     const doctors = doctorsData.find((doctor) => doctor.id === item.doctorsId)
//     return {
//       ...item,
//       doctors,
//     }
//   })
//   await sleep()
//   return data
// }

// export const getUserById = async (id: UserType['id']): Promise<UserType | void> => {
//   const user = userData.find((user) => user.id === id)
//   if (user) {
//     await sleep()
//     return user
//   }
// }

// export const getAllFiles = async (): Promise<FilesType[]> => {
//   const data = filesData.map((item) => {
//     const user = socialUserData.find((user) => user.id == item.userId)
//     return {
//       ...item,
//       user,
//     }
//   })
//   await sleep()
//   return data
// }


// export const getAllPatients = async (): Promise<PatientsType[]> => {
//   const data = patientsData.map((item) => {
//     const user = socialUserData.find((user) => user.id == item.userId)
//     return {
//       ...item,
//       user,
//     }
//   })
//   await sleep()
//   return data
// }

// export const getAllOrders = async (): Promise<OrderType[]> => {
//   const data = orderData.map((item) => {
//     const users = socialUserData.find((user) => user.id == item.userId)
//     return {
//       ...item,
//       users,
//     }
//   })
//   await sleep()
//   return data
// }

// export const getAllCustomers = async (): Promise<CustomersType[]> => {
//   const data = customersData.map((item) => {
//     const users = socialUserData.find((user) => user.id == item.userId)
//     return {
//       ...item,
//       users,
//     }
//   })
//   await sleep()
//   return data
// }


// export const getAllPayments = async (): Promise<PaymentType[]> => {
//   const data = paymentData.map((item) => {
//     const user = socialUserData.find((product) => product.id === item.userId)
//     const doctors = doctorsData.find((doctor) => doctor.id === item.doctorsId)
//     return {
//       ...item,
//       user,
//       doctors,
//     }
//   })
//   await sleep()
//   return data
// }

// export const getAllInvoices = async (): Promise<InvoicesType[]> => {
//   const data = invoicesData.map((item) => {
//     const users = socialUserData.find((product) => product.id === item.userId)
//     const products = productData.find((product) => product.id === item.productId)
//     return {
//       ...item,
//       users,
//       products,
//     }
//   })
//   await sleep()
//   return data
// }



// export const getAllReviews = async (): Promise<ReviewType[]> => {
//   const data = reviewData.map((item) => {
//     const doctors = doctorListData.find((doctor) => doctor.id == item.doctorsId)
//     return {
//       ...item,
//       doctors,
//     }
//   })
//   await sleep()
//   return data
// }