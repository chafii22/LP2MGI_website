"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, Monitor } from 'lucide-react'
import Styles from './Navbar.module.css'

type ThemeMode = 'light' | 'dark' | 'system'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/Overview', label: 'Overview' },
    { href: '/Teams', label: 'Teams' },
    { href: '/Publications', label: 'Publications' },
    { href: '/Platform', label: 'Platform' },
    { href: '/News', label: 'News' },
    { href: '/Contact', label: 'Contact' },
  ]

  const handleToggle = () => setIsOpen((prev) => !prev)
  const handleClose = () => setIsOpen(false)

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement

    if (mode === 'system') {
      root.removeAttribute('data-theme')
      return
    }

    root.setAttribute('data-theme', mode)
  }

  const cycleThemeMode = () => {
    const nextMode: ThemeMode =
      themeMode === 'system' ? 'light' : themeMode === 'light' ? 'dark' : 'system'

    setThemeMode(nextMode)
    localStorage.setItem('theme-mode', nextMode)
    applyTheme(nextMode)
  }

  const currentThemeLabel =
    themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'

  const themeIcon =
    themeMode === 'system' ? <Monitor size={18} aria-hidden="true" /> :
    themeMode === 'light' ? <Sun size={18} aria-hidden="true" /> :
    <Moon size={18} aria-hidden="true" />

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }

    return pathname === href || pathname.startsWith(`${href}/`)
  }

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const storedMode = localStorage.getItem('theme-mode')
    const initialMode: ThemeMode =
      storedMode === 'light' || storedMode === 'dark' || storedMode === 'system'
        ? storedMode
        : 'system'

    setThemeMode(initialMode)
    applyTheme(initialMode)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <nav className={Styles.navbar}>
      {/* logo */}
      <div className={Styles.brand}>
        <Link href='/' className={Styles.logoLink} onClick={handleClose}>
          <Image src="/logo_ESTC.png" alt="Logo" width={32} height={32} />
        </Link>
        <p className={Styles.brandText}>LP2MGI</p>
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