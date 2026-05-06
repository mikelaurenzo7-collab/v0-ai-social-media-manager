import { CreateContent } from '@/components/create/create-content'
import { Suspense } from 'react'

export default function CreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateContent />
    </Suspense>
  )
}
