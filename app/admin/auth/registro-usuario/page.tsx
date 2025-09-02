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
import Image from "next/image";

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
          Pudes cargar achivos tipo <b>[ .xlsx, .xls ]</b>
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
            <div className="my-4">
              <h2 className="rounded-md bg-white px-3 py-1 text-start font-semibold text-green-500 shadow-md w-max">
                Para registrar una gran cantidad de Alumnos:
              </h2>
              <h2 className="mt-2 rounded-md bg-white px-3 py-1 text-start font-normal text-slate-500 shadow-md w-full">
                <b className="text-rose-700">
                  Consideraciones importantes:
                </b>
                <br />
                <b>
                  • Conservar el nombre original de las cabeceras de tablas: "name", "matricula", "licenciatura", "password", "confirmPassword", "userType".
                </b>
                <br />
                <b>
                  • Las Licenciaturas desponibles deberán ser escritas única y exactamente de la siguiente manera (Sin acentos, espacios, ni mínusculas):
                </b>
                <br />
                CONTADOR_PUBLICO
                <br />
                ADMINISTRACION
                <br />
                INFORMATICA
                <br />
                ADMINISTRACION_PUBLICA
                <br />
                ECONOMIA
                <br />
                ADMINISTRACION_POLITICAS_PUBLICAS
                <br />
                <b>
                  • El tipo de usuario (userType) para Estudiantes derá ser escrito de la siguiente manera:
                </b>
                <br />
                STUDENT
              </h2>
              <Image src="/alumnos.png" alt="" width={1000} height={1000} priority className="my-2" />
            </div>
            <div className="my-4">
              <h2 className="rounded-md bg-white px-3 py-1 text-start font-semibold text-blue-500 shadow-md w-max">
                Para registrar una gran cantidad de Docentes:
              </h2>
              <h2 className="mt-2 rounded-md bg-white px-3 py-1 text-start font-normal text-slate-500 shadow-md w-full">
                <b className="text-rose-700">
                  Consideraciones importantes:
                </b>
                <br />
                <b>
                  • Conservar el nombre original de las cabeceras de tablas: "name", "matricula", "licenciatura", "password", "confirmPassword", "userType".
                </b>
                <br />
                <b>
                  • En el apartado "licenciatura" para Docentes, el único valor válido aceptado será:
                </b>
                <br />
                NO_APLICA
                <br />
                <b>
                  • El tipo de usuario (userType) para Docentes deberá ser escrito de la siguiente manera:
                </b>
                <br />
                TEACHER
              </h2>
              <Image src="/docentes.png" alt="" width={1000} height={1000} priority className="my-2" />
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
