import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { SubscriptionStatus } from '../components/subscription/SubscriptionStatus'
import { User, Package, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <User className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Vítejte zpět!
                </h1>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Odhlásit se
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Rychlé odkazy
            </h2>
            <div className="space-y-4">
              <Link
                to="/orders"
                className="block p-4 bg-white/5 hover:bg-white/10 border border-emerald-500/20 rounded-lg transition-colors"
              >
                <h3 className="font-medium text-white">Moje objednávky</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Zobrazit historii a stav objednávek
                </p>
              </Link>

              <Link
                to="/profile"
                className="block p-4 bg-white/5 hover:bg-white/10 border border-emerald-500/20 rounded-lg transition-colors"
              >
                <h3 className="font-medium text-white">Můj profil</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Upravit osobní údaje
                </p>
              </Link>

              <Link
                to="/"
                className="block p-4 bg-white/5 hover:bg-white/10 border border-emerald-500/20 rounded-lg transition-colors"
              >
                <h3 className="font-medium text-white">Produkty</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Prohlédnout všechny produkty
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}