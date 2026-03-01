/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import flagUs from '@/assets/images/flags/us.svg'
import Image from 'next/image'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { languages } from '../data'


const Country = () => {
  return (
    <div className="topbar-item">
      <Dropdown className="" align={'end'}>
        <DropdownToggle as={'button'} className="topbar-link content-none" data-bs-offset="0,25" aria-haspopup="false"
                        aria-expanded="false">
          <Image src={flagUs} alt="user-image" className="w-100 rounded" height={18} id="selected-language-image" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-start">
          {
            languages.map((item, idx) => (
              <DropdownItem key={idx}>
                <Image src={item.image} alt="user-image" className="me-1 rounded" height={18} data-translator-image />
                <span className="align-middle">{item.language}</span>
              </DropdownItem>
            ))
          }
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default Country