
'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Styles from './contact.module.css';
import { createContactMessage } from '@/lib/api';

export default function Contact() {
    const [submitMessage, setSubmitMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        const payload = {
            full_name: String(formData.get('full_name') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            subject: String(formData.get('subject') || '').trim(),
            message: String(formData.get('message') || '').trim(),
        };

        try {
            setIsSubmitting(true);
            setSubmitMessage('');
            await createContactMessage(payload);
            form.reset();
            setSubmitMessage('Thank you. Your message has been sent successfully.');
        } catch {
            setSubmitMessage('Sorry, we could not send your message right now. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                                    name="full_name"
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
                                    name="email"
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
                                    name="subject"
                                    placeholder="What is this about?"
                                    className={Styles.input}
                                    required
                                />
                            </div>

                            <div className={Styles.formGroup}>
                                <label htmlFor="message" className={Styles.label}>Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    placeholder="Your message here..."
                                    className={Styles.textarea}
                                    rows={5}
                                    required
                                ></textarea>
                            </div>

                            <button type="submit" className={Styles.submitButton} disabled={isSubmitting}>
                                <Send size={18} />
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>

                            {submitMessage && (
                                <p className={Styles.formFeedback} role="status" aria-live="polite">
                                    {submitMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}