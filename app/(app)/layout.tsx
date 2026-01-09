import { AppShell } from "./_components/AppShell";
import { AppSessionProvider } from "./_components/SessionProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppSessionProvider>
      <AppShell>{children}</AppShell>
    </AppSessionProvider>
  );
}
