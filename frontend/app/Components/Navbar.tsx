"use client"

import React, { useEffect, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import Styles from './Navbar.module.css'
import { getSiteSettings } from '@/lib/api'

type ThemeMode = 'light' | 'dark'

const Navbar = () => {
  const [openPath, setOpenPath] = useState<string | null>(null)
  const [brandTitle, setBrandTitle] = useState('LP2MGI')
  const [brandLogo, setBrandLogo] = useState('/Logo_ESTC.png')
  const { resolvedTheme, setTheme } = useTheme()
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const pathname = usePathname()
  const currentPath = pathname ?? '/'
  const isOpen = openPath === currentPath

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/Overview', label: 'Overview' },
    { href: '/Teams', label: 'Teams' },
    { href: '/Publications', label: 'Publications' },
    { href: '/Platform', label: 'Platform' },
    { href: '/News', label: 'News' },
    { href: '/Contact', label: 'Contact' },
  ]

  const handleToggle = () => {
    setOpenPath((prev) => (prev === currentPath ? null : currentPath))
  }

  const handleClose = () => setOpenPath(null)

  const themeMode: ThemeMode = isMounted && resolvedTheme === 'dark' ? 'dark' : 'light'

  const cycleThemeMode = () => {
    if (!isMounted) {
      return
    }

    const nextMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light'

    setTheme(nextMode)
  }

  const currentThemeLabel = isMounted
    ? (themeMode === 'light' ? 'Light' : 'Dark')
    : 'Theme'

  const themeIcon = isMounted
    ? (themeMode === 'light' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />)
    : <Sun size={18} aria-hidden="true" />

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenPath(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadSiteSettings = async () => {
      try {
        const settings = await getSiteSettings()
        if (!isMounted) {
          return
        }

        const nextTitle = settings.navbar_title?.trim() || 'LP2MGI'
        const nextLogo = settings.navbar_logo_url?.trim() || '/Logo_ESTC.png'

        setBrandTitle(nextTitle)
        setBrandLogo(nextLogo)
      } catch {
        if (!isMounted) {
          return
        }

        setBrandTitle('LP2MGI')
        setBrandLogo('/Logo_ESTC.png')
      }
    }

    loadSiteSettings()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <nav className={Styles.navbar}>
      {/* logo */}
      <div className={Styles.brand}>
        <Link href='/' className={Styles.logoLink} onClick={handleClose} aria-label={`${brandTitle} home`}>
          <Image src={brandLogo} alt={`${brandTitle} logo`} width={36} height={36} className={Styles.logoImage} priority unoptimized />
          <span className={Styles.brandText}>{brandTitle}</span>
        </Link>
      </div>

      <div className={Styles.actions}>
        <button
          type="button"
          className={Styles.themeToggle}
          onClick={cycleThemeMode}
          aria-label={isMounted ? `Theme mode: ${currentThemeLabel}. Click to switch mode.` : 'Theme mode toggle'}
          title={isMounted ? `Theme mode: ${currentThemeLabel}` : 'Theme mode'}
          disabled={!isMounted}
        >
          {themeIcon}
          <span className={Styles.srOnly}>Switch theme mode</span>
        </button>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          className={Styles.menuButton}
          onClick={handleToggle}
          aria-label="Toggle navigation menu"
        >
          <span className={Styles.menuIcon} />
          <span className={Styles.srOnly}>Toggle navigation</span>
        </button>
      </div>

      <button
        type="button"
        aria-hidden={!isOpen}
        className={`${Styles.menuOverlay} ${isOpen ? Styles.menuOverlayOpen : ''}`}
        onClick={handleClose}
        tabIndex={isOpen ? 0 : -1}
      />

      {/* nav links */}
      <ul
        id="primary-navigation"
        className={`${Styles.navLinks} ${isOpen ? Styles.navLinksOpen : ''}`}
      >
        {navItems.map((item) => {
          const isActive = isActivePath(item.href)

          return (
            <li key={item.href} className={Styles.navItem}>
              <Link
                href={item.href}
                className={`${Styles.navbtn} ${isActive ? Styles.navbtnActive : ''}`}
                onClick={handleClose}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Navbar