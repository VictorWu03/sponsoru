export default function PrivacyPolicy() {
  const today = new Date().toLocaleDateString();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {today}
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p>
                Sponsoru is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our influencer sponsorship platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Email address and password for account creation</li>
                <li>Profile information (username, full name, bio)</li>
                <li>Social media account connections (YouTube, Instagram, TikTok)</li>
                <li>Analytics and performance data from connected social platforms</li>
                <li>Public profile information from social media accounts</li>
                <li>Content statistics (followers, views, likes, engagement metrics)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide and maintain our influencer platform services</li>
                <li>Display social media analytics and performance metrics</li>
                <li>Connect influencers with potential brand partnerships</li>
                <li>Improve our platform and develop new features</li>
                <li>Send important notifications about your account</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Information Sharing</h2>
              <p className="mb-4">We do not sell your personal information. We may share your information:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>With your consent when applying for sponsorship opportunities</li>
                <li>With trusted service providers (Supabase, Vercel, social media APIs)</li>
                <li>When required by law or to protect our rights and safety</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
              <p>
                We implement industry-standard security measures including encrypted data transmission (SSL/TLS), secure authentication systems, and limited access to personal data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Access and correct your personal data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your data in a readable format</li>
                <li>Disconnect social media accounts at any time</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Third-Party Services</h2>
              <p>
                Our platform integrates with social media platforms (YouTube, Instagram, TikTok). Please review their privacy policies as they govern the data shared with us through their APIs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Us</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <p>
                  <strong>Email:</strong> privacy@sponsoru.com<br />
                  <strong>Website:</strong> https://sponsoru.vercel.app
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 