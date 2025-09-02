"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Licenciatura } from "@prisma/client";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
const ManualFormCreateUser = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    matricula: "",
    licenciatura: "",
    password: "",
    confirmPassword: "",
    userType: "STUDENT",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [matriculaError, setMatriculaError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores al cambiar el valor
    if (name === "name") setNameError(null);
    if (name === "matricula") setMatriculaError(null);
    if (name === "password") setPasswordError(null);
    if (name === "confirmPassword") setConfirmPasswordError(null);
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }));
  };

  const handleLicenciaturaChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      licenciatura: value as any,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    let isValid = true;

    // Validar Nombre
    if (formData.name.length < 10 || formData.name.length > 50) {
      setNameError("El nombre debe tener entre 10 y 50 caracteres");
      isValid = false;
    }

    // Validar Contraseña
    if (formData.password.length < 6 || formData.password.length > 100) {
      setPasswordError("La contraseña debe tener entre 6 y 100 caracteres");
      isValid = false;
    }

    // Validar Confirmar Contraseña
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          matricula: formData.matricula,
          licenciatura: formData.licenciatura,
          password: formData.password,
          userType: formData.userType,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        toast.error("Error al registrarse");
      } else {
        toast.success("Registro exitoso");
        toast.success("La cuenta ha sido creada correctamente");

        router.refresh();

        formData.name = "";
        formData.matricula = "";
        formData.licenciatura = "NO_APLICA";
        formData.password = "";
        formData.confirmPassword = "";
        formData.userType = "STUDENT";

        setFormData(formData);
      }
    } catch (error) {
      console.error("Error al registrarse:", error);
      toast.error("Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  const LicenciaturasArray = Object.values(Licenciatura);


  return (
    <Card className="w-auto">
      <CardHeader className="space-y-1">
        <div className="mb-5 flex w-full flex-col items-center justify-between gap-2 bg-white md:flex-row">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={100}
              height={100}
              priority
            />
            <Image
              src="/fcaei-logo.svg"
              alt="fcaei-logo"
              width={100}
              height={90}
              priority
            />
          </Link>
          <Link href="/admin" className="mt-2 md:mt-0">
            <Button>Volver a Inicio</Button>
          </Link>
        </div>
        <CardTitle className="text-2xl text-slate-500">
          Crear una cuenta para Estudiantes o Docentes
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Ingresa los datos para registrar una nueva cuenta en la plataforma
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nombre completo del usuario"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className="uppercase"
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="matricula">Matricula</Label>
            <Input
              id="matricula"
              name="matricula"
              type="text"
              placeholder="12345678"
              value={formData.matricula}
              onChange={handleChange}
              disabled={isLoading}
            />
            {matriculaError && (
              <p className="text-sm text-red-500">{matriculaError}</p>
            )}
          </div>
          {/* Licenciatura */}
          <div className="space-y-1">
            <Label htmlFor="licenciatura">
              Licenciatura <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.licenciatura}
              onValueChange={handleLicenciaturaChange}
              name="licenciatura"
              disabled={isLoading}
            >
              <SelectTrigger
                id="licenciatura"
              >
                <SelectValue placeholder="Selecciona una Licenciatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Licenciaturas</SelectLabel>
                  {LicenciaturasArray.map((licenciaturaValue) => (
                    <SelectItem key={licenciaturaValue} value={licenciaturaValue}>
                      {licenciaturaValue
                        .replace(/_/g, " ")
                        .charAt(0)
                        .toUpperCase() +
                        licenciaturaValue
                          .replace(/_/g, " ")
                          .slice(1)
                          .toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="relative grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña segura"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          <div className="relative grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma la contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              {confirmPasswordError && (
                <p className="text-sm text-red-500">{confirmPasswordError}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Tipo de usuario</Label>
            <RadioGroup
              value={formData.userType}
              onValueChange={handleUserTypeChange}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="STUDENT" id="student" />
                <Label htmlFor="student">Estudiante</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TEACHER" id="teacher" />
                <Label htmlFor="teacher">Docente</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full bg-baseColor/80 hover:bg-baseColor"
            disabled={isLoading}
          >
            {isLoading ? "Registrando..." : "Registrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ManualFormCreateUser;
