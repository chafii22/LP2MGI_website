"use client"

import React, { useEffect, useRef, useState } from 'react'
import { BiEnvelope, BiPhone, BiLogoLinkedin } from 'react-icons/bi'
import Styles from './Footer.module.css'

function getAdminLinkHref(): string {
  const explicitAdminUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.trim()
  if (explicitAdminUrl) {
    return explicitAdminUrl
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (apiBase && /^https?:\/\//i.test(apiBase)) {
    try {
      const parsed = new URL(apiBase)
      return `${parsed.origin}/admin/`
    } catch {
      return 'http://127.0.0.1:8000/admin/'
    }
  }

  return 'http://127.0.0.1:8000/admin/'
}

const Footer = () => {
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const toastTimeoutRef = useRef<number | null>(null)
  const adminLinkHref = getAdminLinkHref()

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setToast(message)
      setShowToast(true)
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current)
      }
      toastTimeoutRef.current = window.setTimeout(() => {
        setShowToast(false)
      }, 1800)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <footer className={Styles.container}>
      <div className={Styles.topRow}>
        <div className={Styles.brandBlock}>
          <p className={Styles.brandName}>LP2MGI</p>
          <p className={Styles.brandQuote}>
            Multidisciplinary research laboratory dedicated to the advancement of science and engineering
          </p>
          <div className={Styles.iconRow}>
            <button
              type="button"
              className={Styles.iconButton}
              onClick={() => handleCopy('+212 (5) 22 98 47 47', 'Phone copied')}
              aria-label="Copy phone number"
            >
              <BiPhone className={Styles.iconSvg} />
            </button>
            <button
              type="button"
              className={Styles.iconButton}
              onClick={() => handleCopy('contact@lp2mgi.edu.ma', 'Email copied')}
              aria-label="Copy email address"
            >
              <BiEnvelope className={Styles.iconSvg} />
            </button>
            <button
              type="button"
              className={Styles.iconButton}
              onClick={() => handleCopy('https://www.linkedin.com/company/lp2mgi', 'LinkedIn link copied')}
              aria-label="Copy LinkedIn link"
            >
              <BiLogoLinkedin className={Styles.iconSvg} />
            </button>
          </div>
          <div
            className={`${Styles.toast} ${showToast ? Styles.toastVisible : ''}`}
            role="status"
            aria-live="polite"
          >
            {toast}
          </div>
        </div>
      </div>

      <div className={Styles.bottomRow}>
        <p className={Styles.copyright}>
          © 2026 LP2MGI. All rights reserved.
        </p>
        <a href={adminLinkHref} className={Styles.adminLink}>
          Admin
        </a>
      </div>
    </footer>
  )
}

export default Footer