"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import Styles from './Navbar.module.css'

type ThemeMode = 'light' | 'dark'

const Navbar = () => {
  const [openPath, setOpenPath] = useState<string | null>(null)
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    return localStorage.getItem('theme-mode') === 'dark' ? 'dark' : 'light'
  })
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

  const applyTheme = (mode: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', mode)
  }

  const cycleThemeMode = () => {
    const nextMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light'

    setThemeMode(nextMode)
  }

  const currentThemeLabel = themeMode === 'light' ? 'Light' : 'Dark'

  const themeIcon =
    themeMode === 'light' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />

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
    applyTheme(themeMode)
    localStorage.setItem('theme-mode', themeMode)
  }, [themeMode])

  return (
    <nav className={Styles.navbar}>
      {/* logo */}
      <div className={Styles.brand}>
        <Link href='/' className={Styles.logoLink} onClick={handleClose} aria-label="LP2MGI home">
          <Image src="/Logo_ESTC.png" alt="LP2MGI logo" width={36} height={36} className={Styles.logoImage} priority />
          <span className={Styles.brandText}>LP2MGI</span>
        </Link>
      </div>

      <div className={Styles.actions}>
        <button
          type="button"
          className={Styles.themeToggle}
          onClick={cycleThemeMode}
          aria-label={`Theme mode: ${currentThemeLabel}. Click to switch mode.`}
          title={`Theme mode: ${currentThemeLabel}`}
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