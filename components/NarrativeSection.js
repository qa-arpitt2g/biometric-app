"use client";
import Brand from './Brand';
import Image from 'next/image';

export default function NarrativeSection() {
  return (
    <section className="w-full h-screen relative overflow-hidden bg-[#031636] flex flex-col items-center justify-between py-16 px-8 lg:px-12">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-[#1a2b4c]/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[350px] h-[350px] bg-[#006a6a]/20 rounded-full blur-[80px]"></div>
      </div>

      {/* Wavy Divider SVG */}
      <div className="absolute top-0 -right-1 h-full w-20 z-20 pointer-events-none">
        <svg
          className="h-full w-full fill-white"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <path d="M0 0 C 50 0, 50 0, 100 0 L 100 100 C 50 100, 50 100, 0 100 C 30 80, 70 20, 0 0 Z" />
        </svg>
      </div>

      {/* Top Branding Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[600px] pt-4">
        {/* Logo at the top */}
        <div className="mb-10">
          <Brand className="transform scale-110" light={true} />
        </div>

        <div className="mb-6">
          <h2 className="text-[30px] lg:text-[36px] font-bold text-white mb-4 leading-tight tracking-tight">
            It&apos;s not about what you make.<br />
            <span className="text-secondary-container">It&apos;s about what you make possible.</span>
          </h2>
        </div>
      </div>

      {/* Bottom Illustration Content */}
      <div className="relative z-10 w-full flex justify-center items-center pb-8">
        <div className="relative group w-full flex justify-center items-center">
          {/* Stylized Blob behind image */}
          <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-[#1a2b4c]/60 to-[#006a6a]/40 rounded-[40%_60%_70%_30%/40%_50%_60%_40%] blur-2xl animate-blob opacity-40"></div>
          <div className="absolute w-[360px] h-[360px] bg-white/5 backdrop-blur-md rounded-[50%_50%_30%_70%/50%_30%_70%_50%] border border-white/10 animate-blob-reverse"></div>

          <div className="relative z-10 w-full max-w-[440px] transform hover:scale-105 transition-transform duration-700">
            <Image
              alt="Workforce Illustration"
              className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              src="/assets/login-image.webp"
              width={600}
              height={500}
              priority
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 40%; }
          33% { border-radius: 60% 40% 50% 50% / 50% 60% 40% 60%; }
          66% { border-radius: 50% 50% 30% 70% / 50% 30% 70% 50%; }
          100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 40%; }
        }
        .animate-blob {
          animation: blob 10s infinite linear;
        }
        .animate-blob-reverse {
          animation: blob 15s infinite linear reverse;
        }
      `}</style>
    </section>
  );
}
