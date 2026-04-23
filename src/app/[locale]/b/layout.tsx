/**
 * Isolates the retrowave Billboard from the global parchment body overlay.
 * High z-index so the pergamino ::before on body stays underneath.
 */
export default function PublicBillboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-20 min-h-screen bg-[#06010f] text-[#f0e4ff] antialiased">
      {children}
    </div>
  );
}
