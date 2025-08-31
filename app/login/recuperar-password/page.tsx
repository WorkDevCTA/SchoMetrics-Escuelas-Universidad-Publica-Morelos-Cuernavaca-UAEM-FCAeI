import React from "react";
import ForgotPasswordForm from "../components/forgot-password-form";

export default function RestaurarContraseña() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-sky-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">SchoMetrics</h1>
          <p className="mt-2 text-gray-600">Sistema de Gestión Educativa</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
