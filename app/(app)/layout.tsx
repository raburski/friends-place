import { WebNav } from "./_components/WebNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="web-shell">
      <WebNav />
      <main className="web-main">{children}</main>
    </div>
  );
}
