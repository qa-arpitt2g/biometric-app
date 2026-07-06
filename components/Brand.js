import Image from 'next/image';

export default function Brand({ className = "", light = false, compact = false }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/assets/tech2globe-logo.webp"
        alt="Tech2Globe Logo"
        width={200}
        height={80}
        className={`${compact ? 'h-9' : 'h-12'} w-auto object-contain ${light ? 'brightness-0 invert' : ''}`}
        priority
      />
    </div>
  );
}
