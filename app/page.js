import NarrativeSection from "@/components/NarrativeSection";
import Brand from "@/components/Brand";
import LoginForm from "@/components/LoginForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-white font-body-md text-on-background h-screen overflow-hidden flex w-full">
      {/* Left Section: Illustration & Brand Narrative (60% Width) */}
      <div className="hidden lg:block lg:w-[60%] h-full">
        <NarrativeSection />
      </div>
      
      {/* Right Section: Login Interface (40% Width) */}
      <div className="w-full lg:w-[40%] h-screen flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-[400px] flex flex-col h-full justify-center">
          {/* Mobile Brand Header (Hidden on Large) */}
          <div className="lg:hidden flex justify-center mb-12">
            <Brand light={false} />
          </div>
          
          {/* Login Card */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <LoginForm />
          </div>
          
          {/* Footer Links */}
          <div className="mt-12 pt-8">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  );
}
