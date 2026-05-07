import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/dashboard/header'

const platforms = [
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Post directly to your X account',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    iconBg: 'oklch(0.135 0.018 48)',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Share posts and stories to Instagram',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    iconBg: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Publish to your Facebook page',
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    iconBg: '#1877F2',
  },
]

const STEPS = [
  'Click connect and authorize PostPilot to access your account',
  'Create content using AI and select which accounts to post to',
  'Post instantly or schedule for the perfect time',
]

export default function AccountsPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Connected Accounts"
        description="Connect your social media accounts for direct posting"
      />

      <div className="p-6 space-y-6">
        {/* Info Banner */}
        <div
          className="flex items-start gap-4 rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #EA580C12 0%, #DB277712 100%)', border: '1px solid #EA580C30' }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: '#EA580C' }}>Direct posting coming soon!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We&apos;re working on integrating with social media APIs so you can post directly
              from PostPilot. For now, use the copy feature to paste content into your favorite apps.
            </p>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <Card
              key={platform.id}
              className="relative overflow-hidden border-border/60 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-md"
                    style={{ background: platform.iconBg }}
                  >
                    {platform.icon}
                  </div>
                  <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
                    Coming Soon
                  </span>
                </div>
                <CardTitle className="mt-4">{platform.name}</CardTitle>
                <CardDescription>{platform.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  Connect Account
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it will work */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">How account connections will work</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
