export default function GardenScene() {
  return (
    <div className="relative w-full py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/20 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700" />
            <div className="relative rounded-3xl overflow-hidden border-2 border-green-400/30 shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1402850/pexels-photo-1402850.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Cannabis plant"
                className="w-full h-[500px] object-cover animate-subtle-zoom"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                  Přirozený Růst
                </h3>
                <p className="text-gray-200">
                  Každá rostlina je pečlivě pěstována s respektem k přírodě
                </p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700" />
            <div className="relative rounded-3xl overflow-hidden border-2 border-purple-400/30 shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3621953/pexels-photo-3621953.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Woman in nature"
                className="w-full h-[500px] object-cover animate-subtle-sway"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Lidský Dotek
                </h3>
                <p className="text-gray-200">
                  Zkušené ruce pečují o každou fázi růstu
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes subtle-zoom {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s ease-in-out infinite;
        }
        @keyframes subtle-sway {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          25% {
            transform: translateX(-5px) scale(1.02);
          }
          50% {
            transform: translateX(0) scale(1.05);
          }
          75% {
            transform: translateX(5px) scale(1.02);
          }
        }
        .animate-subtle-sway {
          animation: subtle-sway 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
