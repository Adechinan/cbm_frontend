/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import Image from "next/image"
import avatar1 from "@/assets/images/users/avatar-1.jpg"
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from "react-bootstrap"
import { signOut, useSession } from "next-auth/react"
import { currency } from "@/context/constants"
import Link from "next/link"

const ProfileDropdown = () => {
  const { data: session } = useSession()
  const userName = session?.user?.name ?? session?.user?.email ?? 'Utilisateur'

  return (
    <div className="topbar-item nav-user">
      <Dropdown align={'end'}>
        <DropdownToggle as={'a'} className="topbar-link drop-arrow-none px-2" data-bs-toggle="dropdown" data-bs-offset="0,19" type="button" aria-haspopup="false" aria-expanded="false">
          {/* <Image src={avatar1} width={32} className="rounded-circle me-lg-2 d-flex" alt="user-image" /> */}
          <span className="d-lg-flex flex-column gap-1 d-none">
            <h5 className="my-0">{userName}</h5>
            <h6 className="my-0 fw-normal">Agent</h6>
          </span>
          <IconifyIcon icon='tabler:chevron-down' className="d-none d-lg-block align-middle ms-2" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownHeader className="noti-title">
            <h6 className="text-overflow m-0">Bienvenue !</h6>
          </DropdownHeader>
          <DropdownItem as={Link} href="/profile" className="active fw-semibold">
            <IconifyIcon icon='tabler:user-hexagon' className="me-1 fs-17 align-middle" />
            <span className="align-middle">Mon profil</span>
          </DropdownItem>
          {/* <DropdownItem>
            <IconifyIcon icon='tabler:wallet' className="me-1 fs-17 align-middle" />
            <span className="align-middle">Wallet : <span className="fw-semibold">{currency}985.25</span></span>
          </DropdownItem> */}
          {/* <DropdownItem>
            <IconifyIcon icon='tabler:settings' className="me-1 fs-17 align-middle" />
            <span className="align-middle">Settings</span>
          </DropdownItem> */}
          {/* <DropdownItem>
            <IconifyIcon icon='tabler:lifebuoy' className="me-1 fs-17 align-middle" />
            <span className="align-middle">Support</span>
          </DropdownItem> */}
          <div className="dropdown-divider" />
          {/* <DropdownItem>
            <IconifyIcon icon='tabler:lock-square-rounded' className="me-1 fs-17 align-middle" />
            <span className="align-middle">Verrouiller l'écran</span>
          </DropdownItem> */}
          <DropdownItem as={Link} href="/auth/logout" onClick={() => signOut({ redirect: false })} className="active fw-semibold text-danger">
            <IconifyIcon icon='tabler:logout' className="me-1 fs-17 align-middle" />
            <span className="align-middle">Se déconnecter</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default ProfileDropdown