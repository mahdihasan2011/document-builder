import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { Loader2, Phone, KeyRound, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: User, token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiService.sendOtp(phone);
            setStep('OTP');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { user, token } = await apiService.verifyOtp(phone, otp);
            onLoginSuccess(user, token);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-850/40 relative duration-300 animate-in zoom-in-95">
                
                {/* Header */}
                <div className="bg-slate-50/60 dark:bg-slate-950/40 p-6 border-b border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Login to save your resume & templates.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-110 active:scale-90 transition-all p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-sm">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {step === 'PHONE' ? (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Mobile Number</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="tel" 
                                        required
                                        placeholder="+1 (555) 000-0000"
                                        className="input-field !pl-12 text-lg font-semibold tracking-wide"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || phone.length < 5}
                                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] duration-200 border border-violet-500/20 cursor-pointer"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="text-center mb-4 bg-slate-50/50 dark:bg-slate-900/20 py-2.5 px-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                                <span className="text-xs text-slate-400 font-medium">OTP Sent to </span>
                                <span className="text-xs font-bold text-slate-700 dark:text-white">{phone}</span>
                                <button type="button" onClick={() => setStep('PHONE')} className="text-xs font-bold text-indigo-500 ml-2 hover:underline cursor-pointer">Edit</button>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Enter OTP</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors">
                                        <KeyRound className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="1234"
                                        className="input-field !pl-12 text-lg font-bold tracking-widest text-center"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2.5 text-center">Use '1234' for demo verification</p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading || otp.length < 4}
                                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-650 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] duration-200 border border-emerald-500/20 cursor-pointer"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Verify & Login</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
