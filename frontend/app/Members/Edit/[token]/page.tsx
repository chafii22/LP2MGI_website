"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  getMemberEditAccess,
  submitMemberProfileChanges,
  type MemberEditAccessPayload,
  type MemberProfileSubmissionPayload,
} from "@/lib/api";
import styles from "./member-edit.module.css";

type EditableFormState = {
  full_name: string;
  role: string;
  expertise: string;
  email: string;
  biography: string;
  highlight_quote: string;
  research_interests: string;
  milestones: string;
  researchgate_url: string;
  google_scholar_url: string;
  orcid_url: string;
};

const roleOptions = ["Professor", "PhD Student", "Engineer", "Master Student"];

function toFormState(access: MemberEditAccessPayload): EditableFormState {
  return {
    full_name: access.member.full_name || "",
    role: access.member.role || "",
    expertise: access.member.expertise || "",
    email: access.member.email || "",
    biography: access.member.biography || "",
    highlight_quote: access.member.highlight_quote || "",
    research_interests: (access.member.research_interests || []).join("\n"),
    milestones:
      access.member.milestones && access.member.milestones.length > 0
        ? JSON.stringify(access.member.milestones, null, 2)
        : "",
    researchgate_url: access.member.researchgate_url || "",
    google_scholar_url: access.member.google_scholar_url || "",
    orcid_url: access.member.orcid_url || "",
  };
}

function getStatusLabel(status: MemberEditAccessPayload["status"]): string {
  switch (status) {
    case "pending_approval":
      return "Pending approval";
    case "changes_requested":
      return "Changes requested";
    case "active":
      return "Active";
    default:
      return "Pending invitation";
  }
}

export default function MemberEditPage() {
  const params = useParams<{ token: string }>();
  const token = Array.isArray(params?.token) ? params.token[0] : params?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [access, setAccess] = useState<MemberEditAccessPayload | null>(null);
  const [form, setForm] = useState<EditableFormState | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);

  const loadAccess = useCallback(async () => {
    if (!token) {
      setErrorMessage("Invalid edit URL.");
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const payload = await getMemberEditAccess(token);
      setAccess(payload);
      setForm(toFormState(payload));
      setPhotoFile(null);
      setPhotoPreviewUrl("");
      setRemovePhoto(false);
    } catch {
      setAccess(null);
      setForm(null);
      setErrorMessage("This member edit link is invalid or has expired.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photoFile]);

  const canSubmit = useMemo(() => {
    if (!access) {
      return false;
    }
    return access.status !== "pending_approval";
  }, [access]);

  const handleFieldChange = (field: keyof EditableFormState, value: string) => {
    setForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !form) {
      return;
    }

    let parsedMilestones: Array<Record<string, unknown>> = [];
    const milestonesRaw = form.milestones.trim();

    if (milestonesRaw) {
      try {
        const parsed = JSON.parse(milestonesRaw);
        if (!Array.isArray(parsed)) {
          setSubmitMessage("Milestones must be a valid JSON array.");
          return;
        }
        parsedMilestones = parsed as Array<Record<string, unknown>>;
      } catch {
        setSubmitMessage("Milestones must be valid JSON.");
        return;
      }
    }

    const payload: MemberProfileSubmissionPayload = {
      full_name: form.full_name.trim(),
      role: form.role,
      expertise: form.expertise.trim(),
      email: form.email.trim(),
      biography: form.biography.trim(),
      highlight_quote: form.highlight_quote.trim(),
      research_interests: form.research_interests
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      milestones: parsedMilestones,
      researchgate_url: form.researchgate_url.trim(),
      google_scholar_url: form.google_scholar_url.trim(),
      orcid_url: form.orcid_url.trim(),
      photo_file: photoFile,
      remove_photo: removePhoto,
    };

    try {
      setIsSubmitting(true);
      setSubmitMessage("");
      const response = await submitMemberProfileChanges(token, payload);
      setSubmitMessage(response.message);
      await loadAccess();
    } catch {
      setSubmitMessage("Unable to submit your update right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.mainContainer}>
        <p className={styles.stateMessage}>Loading your profile edit form...</p>
      </main>
    );
  }

  if (errorMessage || !access || !form) {
    return (
      <main className={styles.mainContainer}>
        <div className={styles.errorCard}>
          <h1>Member Profile Edit</h1>
          <p>{errorMessage || "This member profile edit URL is not available."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.mainContainer}>
      <section className={styles.headerSection}>
        <p className={styles.subtitle}>LP2MGI Profile Update</p>
        <h1 className={styles.title}>Edit Member Profile</h1>
        <p className={styles.description}>
          Update your profile details below. Your changes will be sent to the administrator for review before being
          published.
        </p>
        <span className={styles.statusBadge} data-status={access.status}>
          {getStatusLabel(access.status)}
        </span>
      </section>

      {access.latest_submission?.admin_comment && (
        <section className={styles.noticeCard}>
          <h2>Administrator Note</h2>
          <p>{access.latest_submission.admin_comment}</p>
        </section>
      )}

      <section className={styles.formSection}>
        <form className={styles.formGrid} onSubmit={handleSubmit}>
          <div className={`${styles.photoField} ${styles.fullWidth}`}>
            <span>Profile photo</span>
            <div className={styles.photoPanel}>
              <div className={styles.photoPreviewWrap}>
                {photoPreviewUrl ? (
                  <img src={photoPreviewUrl} alt="New profile preview" className={styles.photoPreview} />
                ) : removePhoto ? (
                  <div className={styles.photoPlaceholder}>Photo will be removed</div>
                ) : access.member.photo_url ? (
                  <img src={access.member.photo_url} alt="Current profile" className={styles.photoPreview} />
                ) : (
                  <div className={styles.photoPlaceholder}>No current photo</div>
                )}
              </div>

              <div className={styles.photoActions}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null;
                    setPhotoFile(selectedFile);
                    if (selectedFile) {
                      setRemovePhoto(false);
                    }
                  }}
                />
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(event) => {
                      const shouldRemove = event.target.checked;
                      setRemovePhoto(shouldRemove);
                      if (shouldRemove) {
                        setPhotoFile(null);
                      }
                    }}
                  />
                  Remove current photo
                </label>
              </div>
            </div>
          </div>

          <label className={styles.field}>
            <span>Full name</span>
            <input
              type="text"
              value={form.full_name}
              onChange={(event) => handleFieldChange("full_name", event.target.value)}
              required
            />
          </label>

          <label className={styles.field}>
            <span>Role</span>
            <select value={form.role} onChange={(event) => handleFieldChange("role", event.target.value)} required>
              <option value="">Select a role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleFieldChange("email", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Expertise</span>
            <input
              type="text"
              value={form.expertise}
              onChange={(event) => handleFieldChange("expertise", event.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Biography</span>
            <textarea
              rows={5}
              value={form.biography}
              onChange={(event) => handleFieldChange("biography", event.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Highlight quote</span>
            <input
              type="text"
              value={form.highlight_quote}
              onChange={(event) => handleFieldChange("highlight_quote", event.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Research interests (one per line or comma-separated)</span>
            <textarea
              rows={4}
              value={form.research_interests}
              onChange={(event) => handleFieldChange("research_interests", event.target.value)}
            />
          </label>

          <label className={`${styles.field} ${styles.fullWidth}`}>
            <span>Milestones (JSON array)</span>
            <textarea
              rows={6}
              value={form.milestones}
              onChange={(event) => handleFieldChange("milestones", event.target.value)}
              placeholder='[{"date":"2026","label":"Achievement","value":"Description"}]'
            />
          </label>

          <label className={styles.field}>
            <span>ResearchGate URL</span>
            <input
              type="url"
              value={form.researchgate_url}
              onChange={(event) => handleFieldChange("researchgate_url", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Google Scholar URL</span>
            <input
              type="url"
              value={form.google_scholar_url}
              onChange={(event) => handleFieldChange("google_scholar_url", event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>ORCID URL</span>
            <input
              type="url"
              value={form.orcid_url}
              onChange={(event) => handleFieldChange("orcid_url", event.target.value)}
            />
          </label>

          <div className={`${styles.fullWidth} ${styles.actionsRow}`}>
            <button type="submit" disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? "Submitting..." : "Submit for approval"}
            </button>
            {!canSubmit && <p className={styles.helperText}>Your last submission is still pending approval.</p>}
          </div>

          {submitMessage && <p className={`${styles.fullWidth} ${styles.feedback}`}>{submitMessage}</p>}
        </form>
      </section>

      <section className={styles.auditSection}>
        <h2>Audit Log</h2>
        <p className={styles.auditHint}>Every submission and review action is tracked for transparency.</p>
        {access.audit_log.length === 0 ? (
          <p className={styles.helperText}>No audit entries yet.</p>
        ) : (
          <ul className={styles.auditList}>
            {access.audit_log.map((entry) => (
              <li key={entry.id} className={styles.auditItem}>
                <span className={styles.auditType}>{entry.event_type.replace(/_/g, " ")}</span>
                <span className={styles.auditMeta}>By {entry.actor}</span>
                <time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString()}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
