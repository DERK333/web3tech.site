import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const UPDATED = "August 13, 2026";

export default function PrivacyPolicy() {
  const Section = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="font-heading font-bold text-lg text-foreground mb-2 pb-2 border-b border-border/50">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl mb-3">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground">Last updated: {UPDATED}</p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/50 p-6 sm:p-8">
          <Section title="Overview">
            <p>TheWeb3Tech ("we", "us") is a blog publication built on the Base44 platform. We are committed to being transparent about the data we collect and how we use it. This policy explains what we collect, why, and the choices you have.</p>
          </Section>

          <Section title="Newsletter Subscriptions">
            <p>If you subscribe via the /subscribe page or the sidebar widget, we store your email address in our database solely to send you new-article notifications. We never sell, rent, or share your email with third parties.</p>
            <p>You can unsubscribe at any time — every email includes an unsubscribe option, and you can also request removal via the Contact page.</p>
          </Section>

          <Section title="Comments">
            <p>When you post a comment, we store the display name, optional email, and comment text you provide. Your email is never displayed publicly. Comments are subject to moderation and may be edited or removed at our discretion.</p>
          </Section>

          <Section title="Cookies & Local Storage">
            <p>We use browser local storage to remember your theme preference (dark or light mode) and to identify comments you authored so you can edit or delete them. We do not use third-party advertising cookies or tracking pixels.</p>
          </Section>

          <Section title="Analytics">
            <p>We collect anonymized analytics data — page views, traffic sources, and general engagement metrics — to understand which content resonates. This data is aggregated and does not identify individual visitors. We use Google Analytics (read-only access) to review site performance.</p>
          </Section>

          <Section title="Authentication">
            <p>Optional user accounts are managed by the Base44 platform's authentication system. We store your email and display name. We do not store passwords — authentication is handled securely by the platform. You can delete your account and associated data at any time from Settings.</p>
          </Section>

          <Section title="Third-Party Links">
            <p>Our articles and resource pages link to external sites (documentation, tools, download sources). We are not responsible for the privacy practices of those sites. We encourage you to review their privacy policies.</p>
          </Section>

          <Section title="Your Choices">
            <ul className="list-disc pl-5 space-y-1">
              <li>Unsubscribe from emails at any time.</li>
              <li>Clear cookies and local storage via your browser settings.</li>
              <li>Delete your account and data from the Settings page.</li>
              <li>Request a copy or deletion of your data via the Contact page.</li>
            </ul>
          </Section>

          <Section title="Changes to This Policy">
            <p>We may update this policy as our practices evolve. Material changes will be reflected by the "Last updated" date above. Continued use of the site after changes constitutes acceptance.</p>
          </Section>

          <Section title="Contact">
            <p>Questions about this policy or your data? Reach out through the Contact page and we'll respond promptly.</p>
          </Section>
        </div>
      </motion.div>
    </div>
  );
}