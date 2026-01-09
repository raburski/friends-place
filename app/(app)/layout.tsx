import { WebNav } from "./_components/WebNav";
import { AppSessionProvider } from "./_components/SessionProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSessionProvider>
      <div className="web-shell">
        <WebNav />
        <main className="web-main">{children}</main>
      </div>
    </AppSessionProvider>
  );
}
