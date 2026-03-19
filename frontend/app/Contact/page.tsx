
'use client';

import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Styles from './contact.module.css';

export default function Contact() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
    };

    return (
        <main className={Styles.mainContainer}>
            {/* Section 1: Header with Title & Subtitle */}
            <section className={Styles.headerSection}>
                <div className={Styles.headerContent}>
                    <p className={Styles.subtitle}>Get in Touch</p>
                    <h1 className={Styles.title}>Contact LP2MGI Lab</h1>
                    <p className={Styles.description}>
                        Have questions about our research or want to collaborate? We&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Section 2: Contact Content */}
            <section className={Styles.contentSection}>
                <div className={Styles.contentWrapper}>
                    {/* Left Container: Lab Info */}
                    <div className={Styles.labInfoContainer}>
                        <h2 className={Styles.containerTitle}>Contact Information</h2>
                        
                        <div className={Styles.infoCard}>
                            <div className={Styles.iconWrapper}>
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className={Styles.infoTitle}>Email</h3>
                                <p className={Styles.infoText}>contact@lp2mgi.edu.ma</p>
                            </div>
                        </div>

                        <div className={Styles.infoCard}>
                            <div className={Styles.iconWrapper}>
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className={Styles.infoTitle}>Phone</h3>
                                <p className={Styles.infoText}>+212 (5) 22 98 47 47</p>
                            </div>
                        </div>

                        <div className={Styles.infoCard}>
                            <div className={Styles.iconWrapper}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className={Styles.infoTitle}>Address</h3>
                                <p className={Styles.infoText}>
                                    EST Casablanca<br />
                                    Hassan II University<br />
                                    Casablanca, Morocco
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Container: Contact Form */}
                    <div className={Styles.formContainer}>
                        <h2 className={Styles.containerTitle}>Send us a Message</h2>
                        
                        <form onSubmit={handleSubmit} className={Styles.form}>
                            <div className={Styles.formGroup}>
                                <label htmlFor="name" className={Styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Your Name"
                                    className={Styles.input}
                                    required
                                />
                            </div>

                            <div className={Styles.formGroup}>
                                <label htmlFor="email" className={Styles.label}>Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="your.email@example.com"
                                    className={Styles.input}
                                    required
                                />
                            </div>

                            <div className={Styles.formGroup}>
                                <label htmlFor="subject" className={Styles.label}>Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    placeholder="What is this about?"
                                    className={Styles.input}
                                    required
                                />
                            </div>

                            <div className={Styles.formGroup}>
                                <label htmlFor="message" className={Styles.label}>Message</label>
                                <textarea
                                    id="message"
                                    placeholder="Your message here..."
                                    className={Styles.textarea}
                                    rows={5}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className={Styles.submitButton}>
                                <Send size={18} />
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}