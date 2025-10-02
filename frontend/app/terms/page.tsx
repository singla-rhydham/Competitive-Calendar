export default function TermsPage() {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-teal-200 py-12 px-4 sm:px-6">
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 max-w-3xl mx-auto p-8 sm:p-12">
          <div className="prose prose-slate max-w-none">
            <h1 className="text-3xl font-bold text-teal-700 !mb-6">Terms of Service</h1>
            <p className="!mt-0 text-lg font-semibold text-gray-800">
              Terms of Service for <span className="text-teal-600">Competitive Calendar</span>
            </p>
            <p className="!mt-1 text-sm text-gray-500">Last updated: October 2, 2025</p>
  
            <p className="mt-6 text-gray-700 leading-relaxed">
              Welcome to <strong>Competitive Calendar!</strong> By accessing or using our service, you agree to these Terms of Service. Please read them carefully.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By subscribing or using our site, you accept these Terms. If you do not agree, you may not use the service.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">2. Description of Service</h2>
            <p className="text-gray-700">Competitive Calendar allows users to:</p>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>View upcoming programming contests.</li>
              <li>Sync contests to Google Calendar.</li>
              <li>Manage reminders and subscription preferences.</li>
            </ul>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>You agree to use the service only for lawful purposes.</li>
              <li>You are responsible for maintaining the security of your account and devices.</li>
              <li>You must not attempt to disrupt or misuse the service.</li>
            </ul>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">4. Google Account Integration</h2>
            <p className="text-gray-700">
              By using Google OAuth, you authorize us to access your Google Calendar for creating, updating, and deleting contest events as per your settings.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">5. Data &amp; Privacy</h2>
            <p className="text-gray-700">
              Use of your data is governed by our{" "}
              <a href="/privacy" className="text-teal-600 underline">Privacy Policy</a>.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">6. Service Availability</h2>
            <p className="text-gray-700">
              We aim for reliability but do not guarantee uninterrupted service. Outages, errors, or data delays may occur.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">7. Limitation of Liability</h2>
            <p className="text-gray-700">
              We are not responsible for missed contests, data loss, or damages arising from use of the service. Use at your own risk.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">8. Termination</h2>
            <p className="text-gray-700">
              We may suspend or terminate accounts that violate these Terms or misuse the service.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">9. Changes to Terms</h2>
            <p className="text-gray-700">
              We may update these Terms occasionally. Continued use after changes means you accept the revised Terms.
            </p>
  
            <h2 className="text-xl font-semibold text-teal-700 mt-8">10. Contact</h2>
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
  