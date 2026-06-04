"use client";

import { interestTopics } from "@/data/homeData";
import {
  getAuthToken,
  getAuthUserName,
  getServerAuthTokenSnapshot,
  hasCompletedOnboarding,
  setAuthUserOnboarding,
  subscribeToAuthToken,
} from "@/lib/authStorage";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";

const familiarLanguages = [
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "C#",
  "PHP",
  "Go",
  "Ruby",
];

export default function OnboardingPage() {
  const router = useRouter();
  const authToken = useSyncExternalStore(
    subscribeToAuthToken,
    getAuthToken,
    getServerAuthTokenSnapshot
  );
  const authUserName = useSyncExternalStore(subscribeToAuthToken, getAuthUserName, () => null);
  const [step, setStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (authToken === null) {
      router.replace("/login");
      return;
    }

    if (authToken && hasCompletedOnboarding()) {
      router.replace("/");
    }
  }, [authToken, router]);

  function toggleTopic(topic: string) {
    setSelectedTopics((currentTopics) =>
      currentTopics.includes(topic)
        ? currentTopics.filter((currentTopic) => currentTopic !== topic)
        : [...currentTopics, topic]
    );
  }

  function toggleLanguage(language: string) {
    setSelectedLanguages((currentLanguages) =>
      currentLanguages.includes(language)
        ? currentLanguages.filter((currentLanguage) => currentLanguage !== language)
        : [...currentLanguages, language]
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === 1) {
      if (selectedTopics.length === 0) {
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (selectedLanguages.length === 0) {
        return;
      }
      setStep(3);
      return;
    }

    setAuthUserOnboarding({
      interestTopics: selectedTopics,
      familiarLanguages: selectedLanguages,
    });
    router.replace("/");
  }

  if (authToken === undefined || authToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm font-semibold text-slate-600">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                First-time setup
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Welcome{authUserName ? `, ${authUserName}` : ""}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Tell us a little about your interests and familiar languages so your dashboard can feel more relevant.
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              Step {step} of 3
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`h-2 rounded-full ${
                  stepNumber <= step ? "bg-blue-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <form className="mt-8" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div>
                <h2 className="text-xl font-bold">Select interest topics</h2>
                <p className="mt-1 text-sm text-slate-600">Choose at least one area you want help with.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {interestTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);

                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          isSelected
                            ? "border-blue-300 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <h2 className="text-xl font-bold">Select familiar languages</h2>
                <p className="mt-1 text-sm text-slate-600">Choose the languages you already know or feel comfortable with.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {familiarLanguages.map((language) => {
                    const isSelected = selectedLanguages.includes(language);

                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          isSelected
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div>
                <h2 className="text-xl font-bold">Review your setup</h2>
                <p className="mt-1 text-sm text-slate-600">Save this information to continue to your dashboard.</p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-bold text-slate-900">Interest topics</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTopics.map((topic) => (
                        <span key={topic} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-sm font-bold text-slate-900">Familiar languages</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedLanguages.map((language) => (
                        <span key={language} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((currentStep) => Math.max(1, currentStep - 1))}
                disabled={step === 1}
                className="rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {step === 3 ? "Finish setup" : "Continue"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
