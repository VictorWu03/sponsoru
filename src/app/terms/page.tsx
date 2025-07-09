export default function TermsOfService() {
  const today = new Date().toLocaleDateString();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {today}
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Sponsoru, you agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Sponsoru is an influencer sponsorship platform that connects content creators with brands for marketing partnerships. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Social media account integration (YouTube, Instagram, TikTok)</li>
                <li>Analytics and performance tracking</li>
                <li>Sponsorship opportunity matching</li>
                <li>Campaign management tools</li>
                <li>Payment processing for completed campaigns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Eligibility</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>You must be at least 18 years old</li>
                <li>You must have legal capacity to enter into contracts</li>
                <li>You must own or have authorization to connect social media accounts</li>
                <li>You must comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Prohibited Activities</h2>
              <p className="mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide false or misleading information</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Upload malicious code or attempt to hack the Platform</li>
                <li>Engage in fraudulent activities</li>
                <li>Spam or harass other users</li>
                <li>Use automated tools without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Social Media Integration</h2>
              <p>
                By connecting your social media accounts, you authorize us to access and analyze your public profile information, content statistics, and performance metrics in accordance with each platform's API terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Sponsorship Campaigns</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>All sponsored content must comply with FTC disclosure guidelines</li>
                <li>Content must be original and not violate any copyrights</li>
                <li>Content must align with brand guidelines and campaign objectives</li>
                <li>Payment for completed campaigns will be processed according to agreed terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Intellectual Property</h2>
              <p>
                Sponsoru owns all rights to the Platform's design, features, and proprietary technology. You retain ownership of your content but grant us a license to display, analyze, and process it for Platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Privacy</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Disclaimers</h2>
              <p>
                The Platform is provided "as is" without warranties. We do not guarantee the accuracy of analytics data or the success of sponsorship campaigns. To the maximum extent permitted by law, Sponsoru shall not be liable for any indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Termination</h2>
              <p>
                You may terminate your account at any time. We may suspend or terminate your account if you violate these Terms or for any reason at our discretion with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Information</h2>
              <div className="bg-gray-100 p-4 rounded-md">
                <p>
                  <strong>Email:</strong> legal@sponsoru.com<br />
                  <strong>Support:</strong> support@sponsoru.com<br />
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