export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "Sanity Studio",
}

import StudioClient from "@/app/studio/StudioClient"

export default function StudioPage() {
  return <StudioClient />
}
