import { useState } from 'react';
import { Facebook, RefreshCw, Upload, Trash2, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
  synced_products: Array<{ id: string; catalog_id: string }>;
}

export default function FacebookCatalogManager() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async (action: 'sync' | 'fetch' | 'delete') => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/facebook-catalog-sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync catalog');
      }

      if (data.success) {
        setSyncResult(data.results);
        setLastSync(new Date());
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Facebook className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Facebook Catalog Manager</h2>
      </div>

      <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Catalog Sync Status</h3>
          {lastSync && (
            <p className="text-gray-400 text-sm">
              Last synced: {lastSync.toLocaleString('cs-CZ')}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleSync('sync')}
            disabled={syncing}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Sync to Facebook
              </>
            )}
          </button>

          <button
            onClick={() => handleSync('fetch')}
            disabled={syncing}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            Fetch from Facebook
          </button>

          <button
            onClick={() => handleSync('delete')}
            disabled={syncing}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Delete All
          </button>
        </div>

        {syncResult && (
          <div className="bg-black/50 border border-emerald-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">Sync Completed</p>
                <p className="text-gray-400 text-sm mt-1">
                  Success: {syncResult.success} | Failed: {syncResult.failed}
                </p>
              </div>
            </div>

            {syncResult.synced_products.length > 0 && (
              <div className="mt-3">
                <p className="text-gray-400 text-sm mb-2">Synced Products:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {syncResult.synced_products.map((product) => (
                    <div
                      key={product.id}
                      className="text-xs text-gray-500 bg-black/30 px-2 py-1 rounded"
                    >
                      ID: {product.id} → Catalog ID: {product.catalog_id}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {syncResult.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-red-400 text-sm mb-2">Errors:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {syncResult.errors.map((err, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded"
                    >
                      {err.id}: {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">How to use:</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <strong className="text-blue-400">Sync to Facebook:</strong> Uploads all products from your database to Facebook Catalog
            </li>
            <li>
              <strong className="text-blue-400">Fetch from Facebook:</strong> Retrieves product data from Facebook and updates catalog IDs in your database
            </li>
            <li>
              <strong className="text-blue-400">Delete All:</strong> Removes all products from Facebook Catalog (database remains unchanged)
            </li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <h4 className="text-yellow-400 font-semibold mb-2">Required Environment Variables:</h4>
          <ul className="space-y-1 text-sm text-gray-400 font-mono">
            <li>FACEBOOK_CATALOG_ID</li>
            <li>FACEBOOK_ACCESS_TOKEN</li>
            <li>SITE_URL (optional, defaults to botanika.com)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
