import dynamic from "next/dynamic"

// Dynamically import the client-side map component to avoid SSR issues
const LiveMapClient = dynamic(() => import("./live-map-client"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[70vh] bg-gray-50 rounded-md">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

export default function LiveMapTab() {
  return <LiveMapClient />
}