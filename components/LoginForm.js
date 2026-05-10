"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login and redirect to the dashboard/upload page
    router.push('/upload');
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[32px] font-bold text-[#0b1c30] mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-[#44474e] text-base">Please enter your details to access the portal.</p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#44474e] tracking-widest uppercase" htmlFor="email">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[#75777f] group-focus-within:text-[#006a6a] transition-colors">mail</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-4 bg-[#eff4ff] border border-[#c5c6cf]/50 rounded-xl font-medium text-[#0b1c30] placeholder:text-[#75777f]/60 focus:ring-4 focus:ring-[#006a6a]/10 focus:border-[#006a6a] focus:bg-white transition-all outline-none"
              id="email"
              name="email"
              placeholder="name@company.com"
              required
              type="email"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-[#44474e] tracking-widest uppercase" htmlFor="password">Password</label>
            <a className="text-sm text-[#006a6a] font-semibold hover:text-[#004f50] transition-colors" href="#">Forgot Password?</a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[#75777f] group-focus-within:text-[#006a6a] transition-colors">lock</span>
            </div>
            <input
              className="w-full h-14 pl-12 pr-12 bg-[#eff4ff] border border-[#c5c6cf]/50 rounded-xl font-medium text-[#0b1c30] placeholder:text-[#75777f]/60 focus:ring-4 focus:ring-[#006a6a]/10 focus:border-[#006a6a] focus:bg-white transition-all outline-none"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type={showPassword ? "text" : "password"}
            />
            <button
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#75777f] hover:text-[#0b1c30] transition-colors cursor-pointer"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center gap-3 py-1">
          <div className="relative flex items-center">
            <input
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#c5c6cf] bg-[#eff4ff] checked:bg-[#006a6a] checked:border-[#006a6a] transition-all focus:ring-2 focus:ring-[#006a6a]/20"
              id="remember"
              type="checkbox"
            />
            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
            </span>
          </div>
          <label className="text-sm text-[#44474e] cursor-pointer font-medium select-none" htmlFor="remember">
            Keep me signed in
          </label>
        </div>

        {/* CTA Button */}
        <button className="group relative mt-2 w-full h-14 bg-[#031636] hover:bg-[#1a2b4c] text-white font-bold text-lg rounded-xl shadow-lg shadow-[#031636]/20 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden" type="submit">
          <div className="absolute inset-0 w-1/4 h-full bg-white/10 skew-x-[-20deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000 ease-in-out"></div>
          <span className="relative z-10">Sign in</span>
          <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">login</span>
        </button>
      </form>


    </div>
  );
}
