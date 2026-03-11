"use client"

import React, { useEffect, useRef, useState } from 'react'
import { BiEnvelope, BiPhone, BiLogoLinkedin } from 'react-icons/bi'
import Styles from './Footer.module.css'

const Footer = () => {
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const toastTimeoutRef = useRef<number | null>(null)

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
              onClick={() => handleCopy('+212 6 12 34 56 78', 'Phone copied')}
              aria-label="Copy phone number"
            >
              <BiPhone className={Styles.iconSvg} />
            </button>
            <button
              type="button"
              className={Styles.iconButton}
              onClick={() => handleCopy('contact@lp2mgi.example', 'Email copied')}
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
      </div>
    </footer>
  )
}

export default Footer