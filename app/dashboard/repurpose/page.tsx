import { RepurposeStudio } from '@/components/create/repurpose-studio'
import { Suspense } from 'react'

export default function RepurposePage() {
  return (
    <Suspense fallback={<RepurposeSkeleton />}>
      <RepurposeStudio />
    </Suspense>
  )
}

function RepurposeSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg animate-pulse"
          style={{ background: 'linear-gradient(135deg, #EA580C 0%, #DB2777 100%)' }}
        >
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="text-sm font-semibold">Loading Repurpose Studio…</p>
      </div>
    </div>
  )
}
