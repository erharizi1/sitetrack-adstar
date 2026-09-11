/** The login screens: one narrow column, centred — same on phone and desktop. */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col justify-center gap-7 px-6 py-10">
      {children}
    </main>
  );
}
