/** What every admin form action returns, so one component can show the outcome. */
export type FormState = {
  ok: boolean;
  error?: string;
  message?: string;
  /** A one-time link to show the admin (for example an officer invitation). */
  link?: string;
  /** A ready-to-send mailto: that carries the link. */
  mailto?: string;
  /** Where to send the browser after it works (for example the new record's editor). */
  redirectTo?: string;
  /** The invitation email went out from the site itself. */
  emailed?: boolean;
  /** The styled email, so the admin can copy it into their own mail app when the site cannot send. */
  email?: { subject: string; html: string; text: string; to: string };
};
