export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <section className="bg-white rounded-2xl shadow border border-gray-200 max-w-3xl mx-auto p-6 sm:p-10">
        <div className="prose prose-slate max-w-none">
          <h1 className="!mb-4">Privacy Policy</h1>
          <p className="!mt-0 font-semibold">Privacy Policy for Competitive Calendar</p>
          <p className="!mt-1">Last updated: October 2, 2025</p>

          <p>
            Thank you for using Competitive Calendar (“we,” “our,” or “us”). Your privacy is important to us. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
          </p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li>
              <strong>Google Account Information:</strong> Name, email address, and profile picture obtained when you sign in using Google OAuth.
            </li>
            <li>
              <strong>Google Calendar Data:</strong> With your consent, we access your calendar to create/update/remove contest events.
            </li>
            <li>
              <strong>Preferences:</strong> Subscription preferences, reminder settings, and selected contest platforms.
            </li>
            <li>
              <strong>Technical Information:</strong> IP address, browser type, device info, usage stats.
            </li>
          </ul>
          <p>We do not collect sensitive data such as passwords or payments.</p>

          <h2>2. How We Use Information</h2>
          <ul>
            <li>Provide contest notifications.</li>
            <li>Sync events with your calendar.</li>
            <li>Customize reminders and preferences.</li>
            <li>Improve service performance.</li>
            <li>Ensure security and prevent abuse.</li>
          </ul>
          <p>We never sell your data.</p>

          <h2>3. Data Sharing</h2>
          <p>We may share only with:</p>
          <ul>
            <li>Google APIs (as authorized by you).</li>
            <li>Hosting providers (Render, Vercel, MongoDB Atlas).</li>
            <li>Legal authorities if required.</li>
          </ul>
          <p>No advertisers.</p>

          <h2>4. Data Security</h2>
          <ul>
            <li>HTTPS encryption.</li>
            <li>Secure token storage.</li>
            <li>Restricted backend access.</li>
          </ul>
          <p>No system is 100% secure.</p>

          <h2>5. Data Retention &amp; Deletion</h2>
          <ul>
            <li>Tokens are stored only while subscribed.</li>
            <li>Unsubscribing deletes tokens &amp; events.</li>
            <li>You can request full deletion anytime via <a href="mailto:singlarhydham2004@gmail.com">singlarhydham2004@gmail.com</a>.</li>
          </ul>

          <h2>6. Children’s Privacy</h2>
          <p>Not for under-13 users.</p>

          <h2>7. Changes</h2>
          <p>We may update this policy, notifying users if significant.</p>

          <h2>8. Contact</h2>
          <p>📧 <a href="mailto:singlarhydham2004@gmail.com">singlarhydham2004@gmail.com</a><br/>🌐 <a href="https://competitive-calendar.vercel.app" target="_blank" rel="noopener noreferrer">https://competitive-calendar.vercel.app</a></p>
        </div>
      </section>
    </main>
  );
}
