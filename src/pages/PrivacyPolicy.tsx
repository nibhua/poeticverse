
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <motion.div 
      className="max-w-3xl mx-auto py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="text-4xl font-bold text-gradient-subtle mb-6"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Privacy Policy
      </motion.h1>
      
      <motion.div 
        className="prose mt-8 glass-card p-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2>1. Introduction</h2>
        <p>
          Welcome to Poeticverse. We are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and share information when you use our website and services.
        </p>
        
        <h2>2. Information We Collect</h2>
        <p>
          We collect information when you:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Create an account</li>
          <li>Upload poetry or other content</li>
          <li>Participate in workshops or competitions</li>
          <li>Comment on or like other users' content</li>
          <li>Contact our support team</li>
        </ul>
        
        <h2>3. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions</li>
          <li>Send you technical notices and updates</li>
          <li>Respond to your comments and questions</li>
          <li>Protect against harmful or illegal activity</li>
        </ul>
        
        <h2>4. Sharing Your Information</h2>
        <p>
          We may share your information with:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Service providers who help us operate our platform</li>
          <li>Legal authorities when required by law</li>
          <li>Other users, according to your privacy settings</li>
        </ul>
        
        <h2>5. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Access and download a copy of your data</li>
          <li>Request correction of inaccurate personal information</li>
          <li>Request deletion of your personal information</li>
          <li>Object to processing of your personal information</li>
        </ul>
        
        <h2>6. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to provide you with our services and as required by law.
        </p>
        
        <h2>7. Security</h2>
        <p>
          We implement reasonable measures to protect your information from unauthorized access, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
        </p>
        
        <h2>8. Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </p>
        
        <h2>9. Contact Us</h2>
        <p>
          If you have any questions about our Privacy Policy or practices, please contact us at privacy@poeticverse.com.
        </p>
        
        <p className="text-sm text-gray-500 mt-8">Last Updated: May 1, 2025</p>
      </motion.div>
    </motion.div>
  );
}
