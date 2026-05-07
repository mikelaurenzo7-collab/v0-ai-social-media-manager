import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/dashboard/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getHelpArticle, getRelatedArticles, HELP_ARTICLES } from '@/lib/help-articles'

interface Params { slug: string }

export function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const article = getHelpArticle(slug)
  if (!article) return { title: 'Help' }
  return {
    title: article.title,
    description: article.blurb,
  }
}

export default async function HelpArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const article = getHelpArticle(slug)
  if (!article) notFound()

  const related = getRelatedArticles(slug)

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title={article.title}
        description={article.blurb}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/help">← All articles</Link>
          </Button>
        }
      />

      <div className="p-6 grid gap-6 lg:grid-cols-[1fr_280px] max-w-5xl mx-auto w-full">
        {/* Article body */}
        <article className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {article.category}
            </Badge>
            <span className="text-[11px] text-muted-foreground">{article.read} read</span>
          </div>

          <div className="space-y-6">
            {article.body.map((section, i) => (
              <section key={i} className="space-y-3">
                {section.heading && (
                  <h2 className="text-base font-bold tracking-tight">{section.heading}</h2>
                )}
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="text-[15px] leading-relaxed text-foreground/85"
                    dangerouslySetInnerHTML={{
                      __html: p
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                    }}
                  />
                ))}
              </section>
            ))}
          </div>

          <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 mt-8">
            <p className="text-sm font-bold">Did this answer your question?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We read every reply. If something was unclear, tell us — we&apos;ll fix the article.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                👍 Yes
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                👎 Not really
              </Button>
              <Button asChild size="sm" variant="ghost" className="text-xs">
                <a href={`mailto:support@postpilot.app?subject=Article%20feedback%3A%20${encodeURIComponent(article.title)}`}>
                  Email support →
                </a>
              </Button>
            </div>
          </div>
        </article>

        {/* Related */}
        <aside className="space-y-3">
          {related.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Related
                </p>
                <ul className="space-y-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/dashboard/help/${r.slug}`}
                        className="block rounded-lg border border-border/40 bg-card p-3 hover:bg-muted/40 transition-colors"
                      >
                        <p className="text-xs font-semibold leading-snug">{r.title}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{r.read} read</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
            <p className="text-xs font-semibold">Still stuck?</p>
            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
              Real humans answer in &lt; 2h on Pro+, business hours on Free.
            </p>
            <Button
              asChild
              size="sm"
              className="mt-3 w-full text-xs"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <a href="mailto:support@postpilot.app">Email support</a>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
