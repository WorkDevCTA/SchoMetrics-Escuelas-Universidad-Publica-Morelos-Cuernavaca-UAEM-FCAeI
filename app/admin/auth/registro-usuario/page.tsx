import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FloatingNavAdmin } from "../../components/FloatingNavAdmin";
import { BulkUserUploader } from "./components/BulkUserUploader";
import ManualFormCreateUser from "./components/ManualFormCreatUser";
import ExampleFilesDownloadable from "./components/ExampleFilesDownloadable";

export default function RegisterPage() {
  const exampleDataListStudent = [
    {
      name: "MARCO ANTONIO",
      matricula: "20250001",
      password: "EcoPassGeneracion2025",
      confirmPassword: "EcoPassGeneracion2025",
      userType: "STUDENT",
    },
    {
      name: "JOSÉ LÓPEZ",
      matricula: "20250002",
      password: "EcoPassGeneracion2025",
      confirmPassword: "EcoPassGeneracion2025",
      userType: "STUDENT",
    },
    {
      name: "LUCÍA RAMÍREZ",
      matricula: "20250003",
      password: "EcoPassGeneracion2025",
      confirmPassword: "EcoPassGeneracion2025",
      userType: "STUDENT",
    },
  ];
  const exampleDataListTeacher = [
    {
      name: "LUIS NAVARRO",
      matricula: "DC250001",
      password: "EcoPassGeneracion2025",
      confirmPassword: "EcoPassGeneracion2025",
      userType: "TEACHER",
    },
    {
      name: "GABRIELA JIMÉNEZ",
      matricula: "DC250002",
      password: "EcoPassGeneracion2025",
      confirmPassword: "EcoPassGeneracion2025",
      userType: "TEACHER",
    },
    {
      name: "ISABELA MENDOZA",
      matricula: "DC250003",
      password: "EcoPassGeneracion2025",
      confirmPassword: "EcoPassGeneracion2025",
      userType: "TEACHER",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="flex flex-col items-center justify-center"></div>
      <FloatingNavAdmin />
      <div className="my-5 flex w-auto flex-col items-center justify-center gap-4 rounded-xl p-3 lg:w-[800px] xl:w-[1000px] xl:p-10">
        <h1 className="text-center text-4xl font-bold text-baseColor">
          Carga Manual de Nuevos Usuario
        </h1>
        <p className="text-balance text-center text-xl text-baseColor">
          Crea nuevos Usuarios de manera individual para SchoMetrics.
        </p>
        <ManualFormCreateUser />
      </div>

      <div className="my-5 flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-transparent p-3 lg:w-[800px] xl:w-[1000px] xl:p-10">
        <h1 className="text-center text-4xl font-bold text-blue-500">
          Carga Masiva de Nuevos Usuario
        </h1>
        <span className="text-balance text-center text-xl text-blue-500">
          Pudes cargar achivos tipo <b>[ .csv, .xlsx, .xls ]</b>
        </span>

        <BulkUserUploader />

        <div className="flex w-full flex-col items-center justify-center text-center">
          <div className="my-3 mb-5 rounded-sm border-2 border-dashed border-blue-500 p-3 px-6 hover:border-dotted">
            <h2 className="pb-3 text-2xl font-semibold text-blue-900">
              Descargar Archivos de Ejemplo:
            </h2>
            <ExampleFilesDownloadable />
          </div>
          <h2 className="rounded-md bg-white px-3 py-1 text-start font-semibold text-red-500 shadow-md">
            En archivos [.xlsx, .xls ]. Para una correcta aceptación del archivo
            y el correcto procesamiento en la Base de datos, es obligatorio que
            la estructura de los datos sea de la siguiente manera:{" "}
          </h2>
          <div className="w-full">
            <div className="my-5 overflow-x-auto rounded-sm bg-gray-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center text-slate-100">
                      name
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      matricula
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      password
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      confirmPassword
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      userType
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exampleDataListStudent.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center text-slate-100">
                        {data.name}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.matricula}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.password}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.confirmPassword}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.userType}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="my-5 w-full overflow-x-auto rounded-sm bg-gray-800">
              <Table className="my-5">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center text-slate-100">
                      name
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      matricula
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      password
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      confirmPassword
                    </TableHead>
                    <TableHead className="text-center text-slate-100">
                      userType
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {exampleDataListTeacher.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center text-slate-100">
                        {data.name}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.matricula}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.password}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.confirmPassword}
                      </TableCell>
                      <TableCell className="text-center text-slate-100">
                        {data.userType}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center text-center">
          <h2 className="rounded-md bg-white px-3 py-1 text-start font-semibold text-red-500 shadow-md">
            En archivos [.csv (Comma Separated Values) ]. Para una correcta
            aceptación del archivo y el correcto procesamiento en la Base de
            datos, es obligatorio que la estructura de los datos sea de la
            siguiente manera:{" "}
          </h2>
          <div className="mt-5 flex w-full flex-col items-start justify-center overflow-auto rounded-sm bg-gray-800 p-2 text-slate-100">
            <span className="text-start font-semibold">
              name,matricula,password,confirmPassword,userType
            </span>
            <span className="text-start">
              MARCO
              ANTONIO,20250001,EcoPassGeneracion2025,EcoPassGeneracion2025,STUDENT
            </span>
            <span className="text-start">
              JOSÉ
              LÓPEZ,20250002,EcoPassGeneracion2025,EcoPassGeneracion2025,STUDENT
            </span>
            <span className="text-start">
              LUCÍA
              RAMÍREZ,20250003,EcoPassGeneracion2025,EcoPassGeneracion2025,STUDENT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
