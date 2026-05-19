// Pulse skeleton shown while the app JS loads
export default function Skeleton() {
  return (
    <div className="min-h-screen bg-[#fafaf8] animate-pulse">

      {/* Nav skeleton */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="w-36 h-5 bg-slate-200 rounded-full" />
        </div>
        <div className="hidden md:flex gap-3">
          {[80, 64, 72, 80, 56].map((w, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-xl" style={{ width: w }} />
          ))}
          <div className="w-28 h-10 bg-slate-200 rounded-2xl ml-4" />
        </div>
        <div className="md:hidden w-8 h-8 bg-slate-200 rounded-lg" />
      </div>

      {/* Hero skeleton */}
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 w-full py-16">

          {/* Left text */}
          <div className="space-y-5">
            <div className="w-56 h-8 bg-slate-200 rounded-full" />
            <div className="space-y-3">
              <div className="w-full h-14 bg-slate-200 rounded-2xl" />
              <div className="w-4/5 h-14 bg-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="w-full h-4 bg-slate-100 rounded-full" />
              <div className="w-3/4 h-4 bg-slate-100 rounded-full" />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="w-40 h-14 bg-slate-200 rounded-2xl" />
              <div className="w-44 h-14 bg-slate-200 rounded-2xl" />
            </div>
            <div className="flex gap-4 pt-2">
              {[1,2,3].map(i => (
                <div key={i} className="text-center">
                  <div className="w-14 h-8 bg-slate-200 rounded-lg mb-1" />
                  <div className="w-14 h-3 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-slate-200 rounded-xl" />
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              <div className="w-full h-56 bg-slate-200" />
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-32 h-4 bg-slate-100 rounded-full" />
                  <div className="w-28 h-4 bg-slate-100 rounded-full" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[70, 90, 80, 100, 75].map((w, i) => (
                    <div key={i} className="h-6 bg-slate-100 rounded-full" style={{ width: w }} />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                  <div className="w-24 h-10 bg-slate-200 rounded-xl" />
                  <div className="w-32 h-11 bg-slate-200 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
