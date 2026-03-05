'use client'

import { X, Shield, Lock, FileText } from 'lucide-react'

interface TermsModalProps {
    isOpen: boolean
    onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Terms & Privacy Policy</h2>
                            <p className="text-xs text-white/40">Last Updated: 1/02/2026</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 text-sm text-white/70 custom-scrollbar whitespace-pre-line leading-relaxed">

                    <h3 className="text-white font-bold mb-2">1. Introduction</h3>
                    <p className="mb-4">
                        Welcome to StruktAI (the "Service", "Platform", "Application", or "Product"), operated by an independent solo developer ("we", "us", "our").
                        By accessing, registering for, or using this Service in any manner, you ("User", "you", "your") acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions ("Terms").
                    </p>

                    <h3 className="text-white font-bold mb-2">2. Beta / Early Access Disclaimer</h3>
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200">
                        <p className="font-semibold">This Service is provided as a Beta / Early Access product.</p>
                        <p>You expressly acknowledge and agree that:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>The Service is experimental, unfinished, and under active development</li>
                            <li>Features may be incomplete, unstable, inaccurate, or change without notice</li>
                            <li>Bugs, errors, downtime, interruptions, or unexpected behavior may occur</li>
                            <li>Data loss, corruption, or deletion may occur</li>
                            <li>Performance, availability, and accuracy are not guaranteed</li>
                        </ul>
                        <p className="mt-2 text-xs opacity-80">The Service is provided "AS IS" and "AS AVAILABLE", solely for testing, evaluation, and early feedback purposes.</p>
                    </div>

                    <h3 className="text-white font-bold mb-2">3. Eligibility</h3>
                    <p className="mb-4">
                        By using this Service, you represent that you are at least 18 years old, have the legal capacity to enter into these Terms, and are using the Service for lawful purposes only. We reserve the right to refuse access to anyone at our sole discretion.
                    </p>

                    <h3 className="text-white font-bold mb-2">4. Use of the Service</h3>
                    <p className="mb-4">
                        You agree to use the Service responsibly and lawfully. You will not misuse, abuse, reverse-engineer, scrape, or exploit the Service. You also agree not to rely on the Service for mission-critical, legal, medical, financial, or safety-critical decisions.
                    </p>

                    <h3 className="text-white font-bold mb-2">5. Data, Storage, and Security</h3>
                    <p className="mb-2 font-semibold">5.1 User Data</p>
                    <p className="mb-2">The Service may process and store user-provided data (images, files) and generated outputs (3D models). We use third-party infrastructure and tools.</p>
                    <p className="mb-2 font-semibold">5.2 No Guarantee of Data Retention</p>
                    <p className="mb-2">We do not guarantee permanent storage. Data may be deleted, reset, or lost at any time. You are responsible for maintaining your own backups.</p>
                    <p className="mb-4 font-semibold">5.3 Security Disclaimer</p>
                    <p className="mb-4">No system is completely secure. Unauthorized access or breaches may occur. You use the Service at your own risk.</p>

                    <h3 className="text-white font-bold mb-2">6. AI & Generated Output Disclaimer</h3>
                    <p className="mb-4">
                        Outputs may be inaccurate, incomplete, misleading, or unusable. Results are not guaranteed to be correct or fit for any purpose. Generated outputs should be reviewed and validated independently.
                    </p>

                    <h3 className="text-white font-bold mb-2">7. No Warranty</h3>
                    <p className="mb-4">
                        To the maximum extent permitted by law, the Service is provided WITHOUT WARRANTIES OF ANY KIND.
                    </p>

                    <h3 className="text-white font-bold mb-2">8. Limitation of Liability</h3>
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
                        <p className="font-bold uppercase text-xs tracking-wider mb-1">Very Important</p>
                        <p>In no event shall we be liable for loss of data, profits, revenue, or business interruption. Maximum liability is limited to the amount paid by you or ₹0/$0, whichever is greater.</p>
                    </div>

                    <h3 className="text-white font-bold mb-2">9. User Responsibility & Indemnification</h3>
                    <p className="mb-4">
                        You are solely responsible for how you use the Service and its outputs. You agree to indemnify and hold harmless the Service operator from any claims arising from your use.
                    </p>

                    <h3 className="text-white font-bold mb-2">10. Prohibited Activities</h3>
                    <p className="mb-4">
                        Strictly prohibited: Unauthorized access, hacking, data abuse, privacy violations, intellectual property abuse (copying/scraping), and illegal/harmful use.
                    </p>

                    <h3 className="text-white font-bold mb-2">11. Monitoring & Enforcement</h3>
                    <p className="mb-4">
                        We reserve the right to monitor usage, investigate violations, and suspend/terminate accounts without notice.
                    </p>

                    <h3 className="text-white font-bold mb-2">12. Legal Consequences</h3>
                    <p className="mb-4">
                        Any attempt to hack or exploit the Service is a serious violation. We reserve the right to pursue legal action and seek financial damages.
                    </p>

                    <h3 className="text-white font-bold mb-2">13. suspension & Termination</h3>
                    <p className="mb-4">
                        We reserve the right to suspend or terminate accounts, reset data, or discontinue the Service at any time without notice.
                    </p>

                    <h3 className="text-white font-bold mb-2">17. Governing Law</h3>
                    <p className="mb-4">
                        Terms governed by the laws of India. Jurisdiction: Courts of Telangana, INDIA.
                    </p>

                    <p className="text-xs text-white/30 pt-4 border-t border-white/10">
                        Contact: Founder@struktai.co.in
                    </p>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    )
}
