import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600 tracking-tight">OralEval B2</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end">
            <Link href="/login" className="text-sm font-semibold leading-6 text-slate-900 hover:text-blue-600">
              Connexion <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              L'évaluation de l'oral DELF B2 simplifiée
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Une plateforme moderne conçue pour les professeurs de FLE. Évaluez facilement vos étudiants, suivez leur progression et générez des rapports selon la grille officielle du DELF B2.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Commencer
              </Link>
              <a href="#features" className="text-sm font-semibold leading-6 text-slate-900 group flex items-center gap-1">
                En savoir plus <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features section mock */}
      <div id="features" className="bg-slate-50 py-24 sm:py-32 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Outils académiques</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Tout ce dont vous avez besoin pour évaluer
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {[
                {
                  name: "Grille officielle DELF B2",
                  description: "Basée sur les critères officiels : Contenu, Langage verbal, Langage non verbal et Support visuel.",
                },
                {
                  name: "Gestion des classes",
                  description: "Organisez vos étudiants par groupes et sessions pour un suivi optimal.",
                },
                {
                  name: "Calcul automatique",
                  description: "Saisissez les notes partielles, la plateforme convertit automatiquement la note finale sur 20.",
                },
                {
                  name: "Suivi de progression",
                  description: "Visualisez l'évolution des compétences de vos étudiants tout au long du semestre.",
                },
              ].map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-slate-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}