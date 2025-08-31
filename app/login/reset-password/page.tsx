import { Suspense } from "react";
import ResetPasswordForm from "../components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-baseColor"></div>
        </div>
      }
    >
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-100 via-white to-green-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">SchoMetrics</h1>
            <p className="mt-2 text-gray-600">Sistema de Gestión Educativa</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </Suspense>
  );
}
