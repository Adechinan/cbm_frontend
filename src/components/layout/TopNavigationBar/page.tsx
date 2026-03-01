/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import LogoBox from '@/components/LogoBox'
import { Suspense } from 'react'
import Apps from './components/Apps'
import HorizontalToggle from './components/HorizontalToggle'
import Languages from './components/Languages'
import LeftSideBarToggle from './components/LeftSideBarToggle'
import Notifications from './components/Notifications'
import PagesDropdown from './components/PagesDropdown'
import ProfileDropdown from './components/ProfileDropdown'
import SearchBar from './components/SearchBar'
import ThemeCustomizerToggle from './components/ThemeCustomizerToggle'
import ThemeModeToggle from './components/ThemeModeToggle'

const TopNavigationBarPage = () => {
  return (
    <header className="app-topbar">
      <div className="page-container topbar-menu">
        <div className="d-flex align-items-center gap-2">
          <LogoBox />
          <LeftSideBarToggle />
          <HorizontalToggle />
          {/* <SearchBar /> */}
          {/* <PagesDropdown /> */}
        </div>
        <div className="d-flex align-items-center gap-2">
          {/* <Languages /> */}
          {/* <Suspense>
            <Notifications />
          </Suspense> */}
          {/* <Apps /> */}
          {/* <ThemeCustomizerToggle /> */}
          <ThemeModeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}

export default TopNavigationBarPage