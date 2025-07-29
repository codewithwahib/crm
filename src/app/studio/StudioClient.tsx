// "use client"

// import { useState, useEffect, type ComponentType } from "react"

// export default function StudioClient() {
//   const [StudioComponent, setStudioComponent] = useState<ComponentType | null>(null)

//   useEffect(() => {
//     if (process.env.NODE_ENV !== "production") {
//       Promise.all([
//         import("next-sanity/studio"),
//         import("../../../sanity.config")
//       ]).then(([studioModule, configModule]) => {
//         const { NextStudio } = studioModule
//         const config = configModule.default
//         const Comp = () => <NextStudio config={config} />
//         Comp.displayName = "SanityStudio"
//         setStudioComponent(() => Comp)
//       })
//     }
//   }, [])

//   if (process.env.NODE_ENV === "production") {
//     return (
//       <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
//         <h1>Studio Disabled in Production</h1>
//         <p>
//           Run <code>npm run dev</code> locally to access Sanity Studio.
//         </p>
//       </div>
//     )
//   }

//   return StudioComponent ? <StudioComponent /> : <p>Loading Studio…</p>
// }
