export default function PrivacyPage() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-teal-200 py-12 px-4 sm:px-6">
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 max-w-3xl mx-auto p-8 sm:p-12">
          <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-teal-700 !mb-6">Privacy Policy</h1>
            <p className="!mt-0 text-lg font-semibold text-gray-800">
              Privacy Policy for <span className="text-teal-600">Competitive Calendar</span>
            </p>
            <p className="!mt-1 text-sm text-gray-500">Last updated: October 2, 2025</p>
  
            <p className="mt-6 text-gray-700 leading-relaxed">
              Thank you for using <strong>Competitive Calendar</strong> (“we,” “our,” or “us”).
              Your privacy is important to us. This Privacy Policy explains how we collect, use,
              and safeguard your information when you use our service.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">1. Information We Collect</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li><strong>Google Account Information:</strong> Name, email address, and profile picture obtained via Google OAuth.</li>
              <li><strong>Google Calendar Data:</strong> With your consent, we access your calendar to create/update/remove contest events.</li>
              <li><strong>Preferences:</strong> Subscription preferences, reminder settings, and selected contest platforms.</li>
              <li><strong>Technical Information:</strong> IP address, browser type, device info, usage stats.</li>
            </ul>
            <p className="text-gray-600 mt-2">We do not collect sensitive data such as passwords or payments.</p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">2. How We Use Information</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Provide contest notifications.</li>
              <li>Sync events with your calendar.</li>
              <li>Customize reminders and preferences.</li>
              <li>Improve service performance.</li>
              <li>Ensure security and prevent abuse.</li>
            </ul>
            <p className="text-gray-600 mt-2">We never sell your data.</p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">3. Data Sharing</h2>
            <p className="text-gray-700">We may share only with:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Google APIs (as authorized by you).</li>
              <li>Hosting providers (Render, Vercel, MongoDB Atlas).</li>
              <li>Legal authorities if required.</li>
            </ul>
            <p className="text-gray-600 mt-2">No advertisers.</p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">4. Data Security</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>HTTPS encryption.</li>
              <li>Secure token storage.</li>
              <li>Restricted backend access.</li>
            </ul>
            <p className="text-gray-600 mt-2">No system is 100% secure.</p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">5. Data Retention &amp; Deletion</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>Tokens are stored only while subscribed.</li>
              <li>Unsubscribing deletes tokens &amp; events.</li>
              <li>
                You can request full deletion anytime via{" "}
                <a href="mailto:singlarhydham2004@gmail.com" className="text-teal-600 underline">
                  singlarhydham2004@gmail.com
                </a>.
              </li>
            </ul>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">6. Children’s Privacy</h2>
            <p className="text-gray-700">Our service is not intended for users under the age of 13.</p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">7. Changes</h2>
            <p className="text-gray-700">We may update this policy, and will notify users if significant changes occur.</p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">8. Contact</h2>
            <p className="text-gray-700">
              📧{" "}
              <a href="mailto:singlarhydham2004@gmail.com" className="text-teal-600 underline">
                singlarhydham2004@gmail.com
              </a>
              <br />
              🌐{" "}
              <a
                href="https://competitive-calendar.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 underline"
              >
                https://competitive-calendar.vercel.app
              </a>
            </p>
          </div>
        </section>
      </main>
    );
  }
  