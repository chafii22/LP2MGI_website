"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Styles from './Navbar.module.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => setIsOpen((prev) => !prev)
  const handleClose = () => setIsOpen(false)

  return (
    <nav className={Styles.navbar}>
      {/* logo */}
      <div className={Styles.brand}>
        <Link href='/' className={Styles.logoLink} onClick={handleClose}>
          <Image src="/logo_ESTC.png" alt="Logo" width={32} height={32} />
        </Link>
        <p className={Styles.brandText}>LP2MGI</p>
      </div>

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        className={Styles.menuButton}
        onClick={handleToggle}
      >
        <span className={Styles.menuIcon} />
        <span className={Styles.srOnly}>Toggle navigation</span>
      </button>

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
        <li className={Styles.navItem}>
          <Link href='/' className={Styles.navbtn} onClick={handleClose}>
            Home
          </Link>
        </li>

        <li className={Styles.navItem}>
          <Link href='/Overview' className={Styles.navbtn} onClick={handleClose}>
            Overview
          </Link>
        </li>

        <li className={Styles.navItem}>
          <Link href='/Teams' className={Styles.navbtn} onClick={handleClose}>
            Teams
          </Link>
        </li>

        <li className={Styles.navItem}>
          <Link href='/Publications' className={Styles.navbtn} onClick={handleClose}>
            Publications
          </Link>
        </li>

        <li className={Styles.navItem}>
          <Link href='/Platform' className={Styles.navbtn} onClick={handleClose}>
            Platform
          </Link>
        </li>

        <li className={Styles.navItem}>
          <Link href='/News' className={Styles.navbtn} onClick={handleClose}>
            News
          </Link>
        </li>

        <li className={Styles.navItem}>
          <Link href='/Contact' className={Styles.navbtn} onClick={handleClose}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar