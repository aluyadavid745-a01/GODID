import { useParams } from "react-router-dom";
import { useMeta } from "../../hooks/useMeta";
import { useEffect, useState } from "react";
import { catalogApi } from "../../services/api";
import type { ContentPage } from "../../types/domain";

export const StaticPage = () => {
  const { page = "about" } = useParams();
  const [content, setContent] = useState<ContentPage | null>(null);
  useMeta(`${content?.title ?? "Page"} | GODID`, `GODID ${content?.title ?? "store"} information.`);
  useEffect(() => {
    catalogApi.getContentPage(page).then((found) => setContent(found ?? null));
  }, [page]);
  if (!content) return <main className="mx-auto max-w-3xl px-4 py-16 lg:px-8"><h1 className="font-display text-4xl font-semibold">Page not found</h1></main>;
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">GODID</p>
      <h1 className="mt-3 font-display text-5xl font-semibold">{content.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">{content.intro}</p>
      <div className="mt-10 grid gap-6">
        {content.sections.map((section) => (
          <section key={section.heading} className="border-t border-line pt-6">
            <h2 className="font-display text-2xl font-semibold">{section.heading}</h2>
            <p className="mt-3 leading-relaxed text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
};
