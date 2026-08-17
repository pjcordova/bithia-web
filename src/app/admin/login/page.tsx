import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-tarjeta bg-white p-8 sombra-tarjeta">
        <h1 className="text-center text-2xl font-extrabold text-terracota-oscuro">
          Bithia Brand
        </h1>
        <p className="mt-1 text-center text-xs text-rosa">
          Panel de Administración
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
