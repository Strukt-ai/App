import AuthForm from '@/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Strukt.AI',
  description: 'Login to your Strukt.AI account to manage your 3D spaces.',
}

export default function LoginPage() {
  return (
    <main className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-black">
      {/* Premium 2D Abstract Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-500/10 blur-[120px] rounded-full animate-pulse opacity-50" />
            <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-600/10 blur-[100px] rounded-full opacity-50" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
        </div>
      </div>

      {/* Foreground UI Elements */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Logo or Brand Top Left */}
        <div className="absolute top-8 left-8 hidden md:block">
          <h1 className="text-2xl font-heading font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            Strukt.AI
          </h1>
        </div>
        
        {/* The Glassmorphic Form Container */}
        <AuthForm />

        {/* Floating text or links at bottom */}
        <div className="absolute bottom-8 text-xs text-gray-500 font-body">
          &copy; {new Date().getFullYear()} Strukt.AI. All rights reserved.
        </div>
      </div>
    </main>
  );
}
