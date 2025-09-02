// "use client";

// import type React from "react";

// import { useState } from "react";
// import Papa from "papaparse";
// import * as XLSX from "xlsx";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import toast from "react-hot-toast";
// import {
//   PencilIcon,
//   SaveIcon,
//   TrashIcon,
//   UploadIcon,
//   FileTextIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   UsersIcon,
//   AlertCircleIcon,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface BulkUser {
//   name: string;
//   matricula: string;
//   licenciatura: string
//   password: string;
//   confirmPassword: string;
//   userType: "STUDENT" | "TEACHER";
//   error?: string;
// }

// export function BulkUserUploader() {
//   const [users, setUsers] = useState<BulkUser[]>([]);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [isDragOver, setIsDragOver] = useState(false);
//   const router = useRouter();
//   const [originalValues, setOriginalValues] = useState<BulkUser | null>(null);
//   const [isInvalidFile, setIsInvalidFile] = useState(false);

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     processFile(file);
//   };

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(false);
//     const file = e.dataTransfer.files[0];
//     if (file) {
//       processFile(file);
//     }
//   };

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(true);
//   };

//   const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragOver(false);
//   };

//   const processFile = (file: File) => {
//     setFileName(file.name);

//     // Verificar si el archivo es válido
//     if (
//       !file.name.endsWith(".csv") &&
//       !file.name.endsWith(".xlsx") &&
//       !file.name.endsWith(".xls")
//     ) {
//       setIsInvalidFile(true);
//       toast.error("Archivo no soportado. Usa .csv o .xlsx");
//       return;
//     }

//     setIsInvalidFile(false);
//     const reader = new FileReader();

//     reader.onload = (event) => {
//       const data = event.target?.result;
//       if (!data) return;

//       if (file.name.endsWith(".csv")) {
//         Papa.parse(data as string, {
//           header: true,
//           skipEmptyLines: true,
//           complete: (results) => {
//             const parsed = results.data as BulkUser[];
//             validateUsersWithServer(parsed);
//           },
//         });
//       } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
//         const workbook = XLSX.read(data, { type: "binary" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];
//         const json: BulkUser[] = XLSX.utils.sheet_to_json(worksheet);
//         validateUsersWithServer(json);
//       } else {
//         toast.error("Archivo no soportado. Usa .csv o .xlsx");
//       }
//     };

//     if (file.name.endsWith(".csv")) {
//       reader.readAsText(file);
//     } else {
//       reader.readAsBinaryString(file);
//     }
//   };

//   const validateUsersWithServer = async (input: BulkUser[]) => {
//     // Paso 1: Validación básica local
//     const localValidated = input.map((user) => {
//       if (!user.name || user.name.length < 10) {
//         return { ...user, error: "Nombre inválido" };
//       }
//       if (!user.matricula) {
//         return { ...user, error: "Matrícula faltante" };
//       }
//       if (!user.licenciatura || user.name.length < 1) {
//         return { ...user, error: "Tipo de licenciatura inválida" };
//       }
//       if (user.password !== user.confirmPassword) {
//         return { ...user, error: "Contraseñas no coinciden" };
//       }
//       return { ...user, error: undefined };
//     });

//     // Paso 2: Detección de duplicados locales
//     const seen = new Set<string>();
//     const duplicatedLocal = new Set<string>();
//     for (const user of localValidated) {
//       if (seen.has(user.matricula)) {
//         duplicatedLocal.add(user.matricula);
//       } else {
//         seen.add(user.matricula);
//       }
//     }

//     const withLocalDupes = localValidated.map((user) => {
//       if (duplicatedLocal.has(user.matricula)) {
//         return { ...user, error: "Matrícula duplicada en archivo" };
//       }
//       return user;
//     });

//     // Paso 3: Validación contra base de datos
//     const matriculas = withLocalDupes.map((u) => u.matricula);
//     try {
//       const res = await fetch("/api/auth/register/validate-matriculas", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ matriculas }),
//       });
//       const { existingMatriculas } = await res.json();
//       const result = withLocalDupes.map((user) => {
//         if (existingMatriculas.includes(user.matricula)) {
//           return { ...user, error: "Matricula ya registrada" };
//         }
//         return user;
//       });
//       setUsers(result);
//     } catch (err) {
//       console.error("Error al validar matrículas:", err);
//       toast.error("Error al validar matrículas");
//       setUsers(withLocalDupes);
//     }
//   };

//   const handleFieldChange = (
//     index: number,
//     field: keyof BulkUser,
//     value: string,
//   ) => {
//     const updated = [...users];
//     updated[index] = { ...updated[index], [field]: value };
//     validateUsersWithServer(updated);
//   };

//   const handleSubmit = async () => {
//     setIsSubmitting(true);
//     const validUsers = users.filter((u) => !u.error);
//     try {
//       const res = await fetch("/api/auth/register/bulk-register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ users: validUsers }),
//       });
//       if (res.ok) {
//         toast.success("Usuarios registrados exitosamente");
//         setUsers([]);
//         setFileName(null);
//       } else {
//         const error = await res.json();
//         toast.error(error.error || "Error en el registro masivo");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error en el servidor");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleRemoveFile = () => {
//     setUsers([]);
//     setFileName(null);
//     setIsInvalidFile(false);
//     toast.error("Carga cancelada");
//     setEditingIndex(null);
//     router.refresh();
//     // window.location.reload()
//   };

//   const handleCancelEdit = (index: number) => {
//     if (originalValues) {
//       const updated = [...users];
//       updated[index] = { ...originalValues };
//       setUsers(updated);
//     }
//     setEditingIndex(null);
//     setOriginalValues(null);
//   };

//   const validUsers = users.filter((u) => !u.error);
//   const invalidUsers = users.filter((u) => u.error);

//   return (
//     <div className="w-full space-y-6">
//       {/* Upload Area */}
//       <Card className="overflow-hidden">
//         <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
//           <CardTitle className="flex items-center gap-2 text-gray-800">
//             <UsersIcon className="h-5 w-5" />
//             Carga Masiva de Usuarios
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6">
//           <div
//             className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out ${isDragOver
//               ? "scale-105 border-blue-400 bg-blue-50"
//               : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
//               } ${fileName && !isInvalidFile ? "border-green-300 bg-green-50" : ""} ${fileName && isInvalidFile ? "border-red-300 bg-red-50" : ""} `}
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//           >
//             <div className="space-y-4">
//               {!fileName ? (
//                 <>
//                   <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
//                     <UploadIcon
//                       className={`h-8 w-8 text-blue-600 transition-transform duration-300 ${isDragOver ? "scale-110" : ""}`}
//                     />
//                   </div>
//                   <div>
//                     <h3 className="mb-2 text-lg font-semibold text-gray-900">
//                       Arrastra tu archivo aquí
//                     </h3>
//                     <p className="mb-4 text-gray-600">
//                       o haz clic para seleccionar un archivo CSV o Excel
//                     </p>
//                     <Input
//                       type="file"
//                       accept=".csv, .xlsx, .xls"
//                       onChange={handleFileUpload}
//                       className="hidden"
//                       id="file-upload"
//                     />
//                     <Button
//                       variant="outline"
//                       className="cursor-pointer bg-transparent transition-colors hover:border-blue-300 hover:bg-blue-50"
//                       onClick={() =>
//                         document.getElementById("file-upload")?.click()
//                       }
//                       type="button"
//                     >
//                       <FileTextIcon className="mr-2 h-4 w-4" />
//                       Seleccionar Archivo
//                     </Button>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   {fileName && !isInvalidFile && (
//                     <div className="duration-500 animate-in fade-in-50">
//                       <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
//                         <CheckCircleIcon className="h-8 w-8 text-green-600" />
//                       </div>
//                       <h3 className="mb-2 text-lg font-semibold text-green-800">
//                         Archivo cargado exitosamente
//                       </h3>
//                       <p className="mb-4 font-medium text-green-700">
//                         {fileName}
//                       </p>
//                       <Button
//                         variant="destructive"
//                         onClick={handleRemoveFile}
//                         className="transition-transform hover:scale-105"
//                       >
//                         <TrashIcon className="mr-2 h-4 w-4" />
//                         Quitar archivo
//                       </Button>
//                     </div>
//                   )}

//                   {fileName && isInvalidFile && (
//                     <div className="duration-500 animate-in fade-in-50">
//                       <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
//                         <XCircleIcon className="h-8 w-8 text-red-600" />
//                       </div>
//                       <h3 className="mb-2 text-lg font-semibold text-red-800">
//                         Formato de archivo no válido
//                       </h3>
//                       <p className="mb-2 font-medium text-red-700">
//                         {fileName}
//                       </p>
//                       <p className="mb-4 text-sm text-red-600">
//                         Solo se aceptan archivos .csv, .xlsx o .xls
//                       </p>
//                       <Button
//                         variant="destructive"
//                         onClick={handleRemoveFile}
//                         className="transition-transform hover:scale-105"
//                       >
//                         <TrashIcon className="mr-2 h-4 w-4" />
//                         Quitar archivo
//                       </Button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Statistics Cards */}
//       {users.length > 0 && (
//         <div className="grid grid-cols-1 gap-4 duration-500 animate-in slide-in-from-bottom-4 md:grid-cols-3">
//           <Card className="border-l-4 border-l-sky-300">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total</p>
//                   <p className="text-2xl font-bold text-sky-600">
//                     {users.length}
//                   </p>
//                 </div>
//                 <UsersIcon className="h-8 w-8 text-sky-500" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-green-500">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Válidos</p>
//                   <p className="text-2xl font-bold text-green-600">
//                     {validUsers.length}
//                   </p>
//                 </div>
//                 <CheckCircleIcon className="h-8 w-8 text-green-500" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-l-4 border-l-red-500">
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">
//                     Con errores
//                   </p>
//                   <p className="text-2xl font-bold text-red-600">
//                     {invalidUsers.length}
//                   </p>
//                 </div>
//                 <XCircleIcon className="h-8 w-8 text-red-500" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Data Table */}
//       {users.length > 0 && (
//         <Card className="rounded-full duration-700 animate-in slide-in-from-bottom-6">
//           <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
//             <CardTitle className="flex items-center gap-2">
//               <AlertCircleIcon className="h-5 w-5" />
//               Previsualización y Edición
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="max-h-[600px] overflow-auto">
//               <table className="w-full text-sm">
//                 <thead className="sticky top-0 z-10 bg-gray-100">
//                   <tr>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Nombre
//                     </th>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Matrícula
//                     </th>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Licenciatura
//                     </th>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Contraseña
//                     </th>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Confirmar Contraseña
//                     </th>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Tipo
//                     </th>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Estado
//                     </th>
//                     <th className="p-4 text-left font-semibold text-gray-700">
//                       Acciones
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((user, i) => (
//                     <tr
//                       key={i}
//                       className={`border-b transition-all duration-200 hover:bg-gray-50 ${user.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"} ${editingIndex === i ? "bg-blue-50 ring-2 ring-blue-200" : ""} `}
//                     >
//                       {editingIndex === i ? (
//                         <>
//                           <td className="p-4">
//                             <Input
//                               value={user.name}
//                               onChange={(e) =>
//                                 handleFieldChange(i, "name", e.target.value)
//                               }
//                               className="w-full uppercase"
//                             />
//                           </td>
//                           <td className="p-4">
//                             <Input
//                               value={user.matricula}
//                               onChange={(e) =>
//                                 handleFieldChange(
//                                   i,
//                                   "matricula",
//                                   e.target.value,
//                                 )
//                               }
//                               className="w-full"
//                             />
//                           </td>
//                           <td className="p-4">
//                             <Input
//                               value={user.licenciatura}
//                               onChange={(e) =>
//                                 handleFieldChange(i, "licenciatura", e.target.value)
//                               }
//                               className="w-full uppercase"
//                             />
//                           </td>
//                           <td className="p-4">
//                             <Input
//                               type="password"
//                               value={user.password}
//                               onChange={(e) =>
//                                 handleFieldChange(i, "password", e.target.value)
//                               }
//                               className="w-full"
//                             />
//                           </td>
//                           <td className="p-4">
//                             <Input
//                               type="password"
//                               value={user.confirmPassword}
//                               onChange={(e) =>
//                                 handleFieldChange(
//                                   i,
//                                   "confirmPassword",
//                                   e.target.value,
//                                 )
//                               }
//                               className="w-full"
//                             />
//                           </td>
//                           <td className="p-4">
//                             <select
//                               value={user.userType}
//                               onChange={(e) =>
//                                 handleFieldChange(i, "userType", e.target.value)
//                               }
//                               className="w-full rounded-md border p-2"
//                             >
//                               <option value="STUDENT">Estudiante</option>
//                               <option value="TEACHER">Docente</option>
//                             </select>
//                           </td>
//                           <td className="p-4">
//                             {user.error ? (
//                               <Badge variant="destructive" className="text-xs">
//                                 {user.error}
//                               </Badge>
//                             ) : (
//                               <Badge
//                                 variant="default"
//                                 className="bg-green-100 text-xs text-green-800"
//                               >
//                                 Válido
//                               </Badge>
//                             )}
//                           </td>
//                           <td className="p-4">
//                             <div className="flex gap-2">
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => {
//                                   setEditingIndex(null);
//                                   setOriginalValues(null);
//                                 }}
//                                 className="hover:border-green-300 hover:bg-green-50"
//                                 title="Guardar cambios"
//                               >
//                                 <SaveIcon className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleCancelEdit(i)}
//                                 className="hover:border-red-300 hover:bg-red-50"
//                                 title="Cancelar edición"
//                               >
//                                 <XCircleIcon className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </td>
//                         </>
//                       ) : (
//                         <>
//                           <td className="p-4 font-medium">{user.name}</td>
//                           <td className="p-4 font-mono">{user.matricula}</td>
//                           <td className="p-4 font-medium">{user.licenciatura}</td>
//                           <td className="p-4 text-gray-500">{user.password}</td>
//                           <td className="p-4 text-gray-500">
//                             {user.confirmPassword}
//                           </td>
//                           <td className="p-4">
//                             <Badge variant="outline" className="text-xs">
//                               {user.userType === "STUDENT"
//                                 ? "Estudiante"
//                                 : "Docente"}
//                             </Badge>
//                           </td>
//                           <td className="p-4">
//                             {user.error ? (
//                               <Badge
//                                 variant="destructive"
//                                 className="text-center text-xs"
//                               >
//                                 {user.error}
//                               </Badge>
//                             ) : (
//                               <Badge
//                                 variant="default"
//                                 className="bg-green-100 text-xs text-green-800"
//                               >
//                                 <CheckCircleIcon className="mr-1 h-3 w-3" />
//                                 Válido
//                               </Badge>
//                             )}
//                           </td>
//                           <td className="p-4">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => {
//                                 setEditingIndex(i);
//                                 setOriginalValues({ ...user });
//                               }}
//                               className="hover:border-blue-300 hover:bg-blue-50"
//                             >
//                               <PencilIcon className="h-4 w-4" />
//                             </Button>
//                           </td>
//                         </>
//                       )}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Submit Button */}
//             <div className="border-t bg-gray-50 p-6">
//               <Button
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || users.every((u) => u.error)}
//                 className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {isSubmitting ? (
//                   <div className="flex items-center gap-2">
//                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
//                     Registrando usuarios...
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <CheckCircleIcon className="h-5 w-5" />
//                     Registrar {validUsers.length} Usuario
//                     {validUsers.length !== 1 ? "s" : ""} Válido
//                     {validUsers.length !== 1 ? "s" : ""}
//                   </div>
//                 )}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }


"use client"

import type React from "react"

import { useState } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import {
  PencilIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  AlertCircleIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface BulkUser {
  name: string
  matricula: string
  licenciatura: string
  password: string
  confirmPassword: string
  userType: "STUDENT" | "TEACHER"
  error?: string
}

export function BulkUserUploader() {
  const [users, setUsers] = useState<BulkUser[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const router = useRouter()
  const [originalValues, setOriginalValues] = useState<BulkUser | null>(null)
  const [isInvalidFile, setIsInvalidFile] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const processFile = (file: File) => {
    setFileName(file.name)

    // Verificar si el archivo es válido
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setIsInvalidFile(true)
      toast.error("Archivo no soportado. Usa .csv o .xlsx")
      return
    }

    setIsInvalidFile(false)
    const reader = new FileReader()

    reader.onload = (event) => {
      const data = event.target?.result
      if (!data) return

      if (file.name.endsWith(".csv")) {
        Papa.parse(data as string, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data as BulkUser[]
            const normalizedData = parsed.map((user) => ({
              ...user,
              matricula: String(user.matricula || "").trim(),
            }))
            validateUsersWithServer(normalizedData)
          },
        })
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json: BulkUser[] = XLSX.utils.sheet_to_json(worksheet)
        const normalizedData = json.map((user) => ({
          ...user,
          matricula: String(user.matricula || "").trim(),
        }))
        validateUsersWithServer(normalizedData)
      } else {
        toast.error("Archivo no soportado. Usa .csv o .xlsx")
      }
    }

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
  }

  const validateUsersWithServer = async (input: BulkUser[]) => {
    // Paso 1: Validación básica local
    const localValidated = input.map((user) => {
      if (!user.name || user.name.length < 10) {
        return { ...user, error: "Nombre inválido" }
      }
      if (!user.matricula) {
        return { ...user, error: "Matrícula faltante" }
      }
      if (!user.licenciatura || user.licenciatura.length < 1) {
        return { ...user, error: "Tipo de licenciatura inválida" }
      }
      if (user.password !== user.confirmPassword) {
        return { ...user, error: "Contraseñas no coinciden" }
      }
      return { ...user, error: undefined }
    })

    // Paso 2: Detección de duplicados locales
    const seen = new Set<string>()
    const duplicatedLocal = new Set<string>()
    for (const user of localValidated) {
      if (seen.has(user.matricula)) {
        duplicatedLocal.add(user.matricula)
      } else {
        seen.add(user.matricula)
      }
    }

    const withLocalDupes = localValidated.map((user) => {
      if (duplicatedLocal.has(user.matricula)) {
        return { ...user, error: "Matrícula duplicada en archivo" }
      }
      return user
    })

    // Paso 3: Validación contra base de datos
    const matriculas = withLocalDupes.map((u) => String(u.matricula))
    try {
      const res = await fetch("/api/auth/register/validate-matriculas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matriculas }),
      })
      const { existingMatriculas } = await res.json()
      const result = withLocalDupes.map((user) => {
        if (existingMatriculas.includes(user.matricula)) {
          return { ...user, error: "Matricula ya registrada" }
        }
        return user
      })
      setUsers(result)
    } catch (err) {
      console.error("Error al validar matrículas:", err)
      toast.error("Error al validar matrículas")
      setUsers(withLocalDupes)
    }
  }

  const handleFieldChange = (index: number, field: keyof BulkUser, value: string) => {
    const updated = [...users]
    const processedValue = field === "matricula" ? String(value).trim() : value
    updated[index] = { ...updated[index], [field]: processedValue }
    validateUsersWithServer(updated)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const validUsers = users.filter((u) => !u.error)
    try {
      const res = await fetch("/api/auth/register/bulk-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: validUsers }),
      })
      if (res.ok) {
        toast.success("Usuarios registrados exitosamente")
        setUsers([])
        setFileName(null)
      } else {
        const error = await res.json()
        toast.error(error.error || "Error en el registro masivo")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error en el servidor")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFile = () => {
    setUsers([])
    setFileName(null)
    setIsInvalidFile(false)
    toast.error("Carga cancelada")
    setEditingIndex(null)
    router.refresh()
    // window.location.reload()
  }

  const handleCancelEdit = (index: number) => {
    if (originalValues) {
      const updated = [...users]
      updated[index] = { ...originalValues }
      setUsers(updated)
    }
    setEditingIndex(null)
    setOriginalValues(null)
  }

  const validUsers = users.filter((u) => !u.error)
  const invalidUsers = users.filter((u) => u.error)

  return (
    <div className="w-full space-y-6">
      {/* Upload Area */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <UsersIcon className="h-5 w-5" />
            Carga Masiva de Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out ${isDragOver
                ? "scale-105 border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              } ${fileName && !isInvalidFile ? "border-green-300 bg-green-50" : ""} ${fileName && isInvalidFile ? "border-red-300 bg-red-50" : ""} `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              {!fileName ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                    <UploadIcon
                      className={`h-8 w-8 text-blue-600 transition-transform duration-300 ${isDragOver ? "scale-110" : ""}`}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">Arrastra tu archivo aquí</h3>
                    <p className="mb-4 text-gray-600">o haz clic para seleccionar un archivo CSV o Excel</p>
                    <Input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      className="cursor-pointer bg-transparent transition-colors hover:border-blue-300 hover:bg-blue-50"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      type="button"
                    >
                      <FileTextIcon className="mr-2 h-4 w-4" />
                      Seleccionar Archivo
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {fileName && !isInvalidFile && (
                    <div className="duration-500 animate-in fade-in-50">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-green-800">Archivo cargado exitosamente</h3>
                      <p className="mb-4 font-medium text-green-700">{fileName}</p>
                      <Button
                        variant="destructive"
                        onClick={handleRemoveFile}
                        className="transition-transform hover:scale-105"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Quitar archivo
                      </Button>
                    </div>
                  )}

                  {fileName && isInvalidFile && (
                    <div className="duration-500 animate-in fade-in-50">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircleIcon className="h-8 w-8 text-red-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-red-800">Formato de archivo no válido</h3>
                      <p className="mb-2 font-medium text-red-700">{fileName}</p>
                      <p className="mb-4 text-sm text-red-600">Solo se aceptan archivos .csv, .xlsx o .xls</p>
                      <Button
                        variant="destructive"
                        onClick={handleRemoveFile}
                        className="transition-transform hover:scale-105"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Quitar archivo
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 gap-4 duration-500 animate-in slide-in-from-bottom-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-sky-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-sky-600">{users.length}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-sky-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Válidos</p>
                  <p className="text-2xl font-bold text-green-600">{validUsers.length}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Con errores</p>
                  <p className="text-2xl font-bold text-red-600">{invalidUsers.length}</p>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      {users.length > 0 && (
        <Card className="rounded-full duration-700 animate-in slide-in-from-bottom-6">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              Previsualización y Edición
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-gray-100">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">Nombre</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Matrícula</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Licenciatura</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Contraseña</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Confirmar Contraseña</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Tipo</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Estado</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <tr
                      key={i}
                      className={`border-b transition-all duration-200 hover:bg-gray-50 ${user.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"} ${editingIndex === i ? "bg-blue-50 ring-2 ring-blue-200" : ""} `}
                    >
                      {editingIndex === i ? (
                        <>
                          <td className="p-4">
                            <Input
                              value={user.name}
                              onChange={(e) => handleFieldChange(i, "name", e.target.value)}
                              className="w-full uppercase"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              value={user.matricula}
                              onChange={(e) => handleFieldChange(i, "matricula", e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              value={user.licenciatura}
                              onChange={(e) => handleFieldChange(i, "licenciatura", e.target.value)}
                              className="w-full uppercase"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="password"
                              value={user.password}
                              onChange={(e) => handleFieldChange(i, "password", e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="p-4">
                            <Input
                              type="password"
                              value={user.confirmPassword}
                              onChange={(e) => handleFieldChange(i, "confirmPassword", e.target.value)}
                              className="w-full"
                            />
                          </td>
                          <td className="p-4">
                            <select
                              value={user.userType}
                              onChange={(e) => handleFieldChange(i, "userType", e.target.value)}
                              className="w-full rounded-md border p-2"
                            >
                              <option value="STUDENT">Estudiante</option>
                              <option value="TEACHER">Docente</option>
                            </select>
                          </td>
                          <td className="p-4">
                            {user.error ? (
                              <Badge variant="destructive" className="text-xs">
                                {user.error}
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-xs text-green-800">
                                Válido
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingIndex(null)
                                  setOriginalValues(null)
                                }}
                                className="hover:border-green-300 hover:bg-green-50"
                                title="Guardar cambios"
                              >
                                <SaveIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelEdit(i)}
                                className="hover:border-red-300 hover:bg-red-50"
                                title="Cancelar edición"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 font-mono">{user.matricula}</td>
                          <td className="p-4 font-medium">{user.licenciatura}</td>
                          <td className="p-4 text-gray-500">{user.password}</td>
                          <td className="p-4 text-gray-500">{user.confirmPassword}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">
                              {user.userType === "STUDENT" ? "Estudiante" : "Docente"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {user.error ? (
                              <Badge variant="destructive" className="text-center text-xs">
                                {user.error}
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-xs text-green-800">
                                <CheckCircleIcon className="mr-1 h-3 w-3" />
                                Válido
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingIndex(i)
                                setOriginalValues({ ...user })
                              }}
                              className="hover:border-blue-300 hover:bg-blue-50"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Button */}
            <div className="border-t bg-gray-50 p-6">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || users.every((u) => u.error)}
                className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-green-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Registrando usuarios...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" />
                    Registrar {validUsers.length} Usuario
                    {validUsers.length !== 1 ? "s" : ""}
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
