export default function Footer() {
  return (
    <footer className="mt-auto py-6 flex justify-center items-center border-t border-outline-variant/10">
      <p className="font-body-sm text-body-sm text-on-surface-variant/60 tracking-wide">
        © 2026{' '}
        <a
          href="https://www.tech2globe.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-on-surface-variant/80 hover:text-primary transition-all duration-300 hover:underline underline-offset-4 decoration-primary/30 cursor-pointer"
        >
          Tech2Globe
        </a>
      </p>
    </footer>
  );
}
