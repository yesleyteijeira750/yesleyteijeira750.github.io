import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#D2691E] dark:from-amber-600 dark:to-amber-800 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#5C2E0F] dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-[#8B4513] dark:text-amber-300">
            Last Updated: February 2026
          </p>
        </motion.div>

        <Card className="border-amber-200 dark:border-amber-800 mb-6">
          <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
            <CardTitle className="text-[#5C2E0F] dark:text-white">Our Commitment to Privacy</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-[#8B4513] dark:text-amber-200 leading-relaxed">
              Bountiful Blessings of Charlotte County Inc. is a non-profit organization dedicated to serving our community. 
              We are committed to protecting your privacy and handling your personal information with care and respect. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Information We Collect */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
              <CardTitle className="text-[#5C2E0F] dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-[#8B4513] dark:text-amber-200">
                <div>
                  <h3 className="font-semibold text-[#5C2E0F] dark:text-white mb-2">Personal Information:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number (when volunteering)</li>
                    <li>Member ID (for check-in purposes)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#5C2E0F] dark:text-white mb-2">Usage Information:</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Check-in dates and times</li>
                    <li>Volunteer event participation</li>
                    <li>App usage and preferences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
              <CardTitle className="text-[#5C2E0F] dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3 text-[#8B4513] dark:text-amber-200">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span><strong className="text-[#5C2E0F] dark:text-white">Service Delivery:</strong> To provide food assistance, coordinate volunteer events, and manage check-ins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span><strong className="text-[#5C2E0F] dark:text-white">Communication:</strong> To send you announcements, event reminders, and important updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span><strong className="text-[#5C2E0F] dark:text-white">Analytics:</strong> To understand usage patterns and improve our services</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                  <span><strong className="text-[#5C2E0F] dark:text-white">Compliance:</strong> To meet legal and regulatory requirements for non-profit organizations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
              <CardTitle className="text-[#5C2E0F] dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                How We Protect Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-[#8B4513] dark:text-amber-200">
                <p>We implement industry-standard security measures to protect your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encrypted data transmission using SSL/TLS</li>
                  <li>Secure cloud storage with regular backups</li>
                  <li>Access controls limiting who can view your information</li>
                  <li>Regular security audits and updates</li>
                  <li>Staff training on data protection and privacy</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
              <CardTitle className="text-[#5C2E0F] dark:text-white">Data Sharing</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-[#8B4513] dark:text-amber-200">
                <p className="font-semibold text-[#5C2E0F] dark:text-white">We do NOT sell your personal information.</p>
                <p>We may share limited information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-[#5C2E0F] dark:text-white">Partner Organizations:</strong> Other food banks or social service agencies when coordinating assistance (with your consent)</li>
                  <li><strong className="text-[#5C2E0F] dark:text-white">Service Providers:</strong> Technology platforms that help us operate (e.g., email services, hosting)</li>
                  <li><strong className="text-[#5C2E0F] dark:text-white">Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
              <CardTitle className="text-[#5C2E0F] dark:text-white">Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-[#8B4513] dark:text-amber-200">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-[#5C2E0F] dark:text-white">Access:</strong> Request a copy of your personal data</li>
                  <li><strong className="text-[#5C2E0F] dark:text-white">Correction:</strong> Update or correct your information</li>
                  <li><strong className="text-[#5C2E0F] dark:text-white">Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong className="text-[#5C2E0F] dark:text-white">Opt-out:</strong> Unsubscribe from promotional emails (service emails may still be sent)</li>
                  <li><strong className="text-[#5C2E0F] dark:text-white">Portability:</strong> Receive your data in a machine-readable format</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
              <CardTitle className="text-[#5C2E0F] dark:text-white">Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-[#8B4513] dark:text-amber-200">
                Our services are not directed to children under 13. We do not knowingly collect personal information 
                from children under 13. If we learn we have collected information from a child under 13, we will delete 
                it immediately. If you believe a child has provided us with personal information, please contact us.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="bg-[#F5EFE6] dark:bg-gray-800">
              <CardTitle className="text-[#5C2E0F] dark:text-white">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-[#8B4513] dark:text-amber-200">
                <p>
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, 
                  please contact us:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#8B4513] dark:text-amber-400" />
                    <span>Phone: +1 (941) 883-8439</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#8B4513] dark:text-amber-400" />
                    <span>Email: aguilesa@gmail.com</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#8B4513] dark:text-amber-400 mt-1" />
                    <span>
                      <strong className="text-[#5C2E0F] dark:text-white">Bountiful Blessings of Charlotte County Inc.</strong>
                      <br />
                      Non-Profit Organization
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <p className="text-sm text-[#8B4513] dark:text-amber-200">
                <strong className="text-[#5C2E0F] dark:text-white">Policy Updates:</strong> We may update this Privacy Policy from time to time. 
                We will notify you of any significant changes by email or through the app. Your continued use of our 
                services after changes are posted constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}