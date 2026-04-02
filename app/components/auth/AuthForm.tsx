'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Building, Phone, ArrowRight, Github } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useFloorplanStore } from '@/store/floorplanStore';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup';

export default function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const router = useRouter();
  const { setToken, setUser, user, rememberMe: storeRememberMe, setRememberMe } = useFloorplanStore();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMeChecked] = useState(storeRememberMe);

  // Mock handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Submitting ${mode}:`, { email, password, fullName, company, phone });
    const normalizedName =
      mode === 'signup'
        ? fullName.trim()
        : (user?.name?.trim() || email.split('@')[0] || 'User');

    setRememberMe(rememberMe);
    setToken(`manual_auth_${Date.now()}`);
    setUser({
      email,
      name: normalizedName,
      picture: user?.picture || ''
    });

    // Mock successful login/signup for Email
    alert(`Successfully submitted ${mode} form for ${email}!`);
    router.push('/home');
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    const token = credentialResponse.credential;
    if (token) {
      setRememberMe(rememberMe);
      setToken(token);
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          email: decoded.email,
          name: decoded.name || decoded.given_name || decoded.email?.split('@')?.[0] || 'User',
          picture: decoded.picture || ''
        });
        router.push('/home');
      } catch (e) {
        console.error("Token decode failed", e);
      }
    }
  };

  const loginWithGithub = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId || clientId === 'your_github_client_id_here') {
      alert('GitHub Login is not configured yet! Please update your .env.local file with your GitHub Client ID.');
      return;
    }

    // Redirect to GitHub's OAuth login page
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user user:email repo`;
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md p-8 overflow-hidden rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="w-full mb-8 text-center relative z-20">
        <h2 className="text-3xl font-heading font-medium tracking-tight text-white mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-gray-400 font-body">
          {mode === 'login'
            ? 'Enter your details to access your 3D spaces.'
            : 'Join Strukt.AI to transform your floor plans.'}
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="flex w-full gap-4 mb-8 relative z-20">
        <div className="flex-1 flex justify-center h-[46px] overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
           <GoogleLogin
             onSuccess={handleGoogleSuccess}
             onError={() => console.log('Login Failed')}
             useOneTap
             theme="filled_black"
             shape="pill"
             text={mode === 'login' ? "signin_with" : "signup_with"}
             width="100%"
           />
        </div>
        <button
          onClick={loginWithGithub}
          className="flex-1 flex items-center justify-center gap-2 h-[46px] rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-white"
        >
          <Github className="w-5 h-5" />
          GitHub
        </button>
      </div>

      <div className="w-full flex items-center gap-4 mb-8 relative z-20">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Or continue with</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4 relative z-20">
        <AnimatePresence mode="popLayout">
          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-4 overflow-hidden"
            >
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  required={mode === 'signup'}
                />
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1 group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="relative flex-1 group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            required
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            required
          />
        </div>

        {mode === 'login' && (
          <div className="flex w-full items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMeChecked(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/40"
              />
              Stay logged in
            </label>
            <button type="button" className="text-xs text-primary/80 hover:text-primary transition-colors">
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-dim p-[1px] mt-4"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-black/10 backdrop-blur-sm transition-all group-hover:bg-transparent">
            <span className="font-semibold text-white tracking-wide">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </form>

      {/* Footer Toggle */}
      <div className="mt-8 text-center relative z-20">
        <p className="text-sm text-gray-400">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-primary hover:text-white transition-colors font-medium ml-1"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}