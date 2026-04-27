import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <ClipboardCheck className="h-7 w-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900">
          Connectez-vous à votre compte
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-2xl sm:px-12 border border-slate-100">
          <form className="space-y-6" action="#" method="POST">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                Adresse e-mail
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                  defaultValue="professeur@ecole.fr"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                  Mot de passe
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                  defaultValue="password"
                />
              </div>
            </div>

            <div>
              <Link
                href="/dashboard"
                className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Vous n'avez pas de compte ?{" "}
          <a href="#" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
            Contactez l'administration
          </a>
        </p>
      </div>
    </div>
  );
}
