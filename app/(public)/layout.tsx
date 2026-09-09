import { PublicFooter } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PublicFooter />
    </>
  );
}
