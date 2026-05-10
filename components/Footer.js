export default function Footer() {
  return (
    <footer className="mt-xl flex justify-between items-center px-xs">
      <span className="font-body-sm text-body-sm text-on-surface-variant/60">© 2026 Tech2Globe</span>
      <div className="flex gap-md">
        <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a>
        <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a>
        <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Support</a>
      </div>
    </footer>
  );
}
