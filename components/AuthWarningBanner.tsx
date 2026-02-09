export default function AuthWarningBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 max-w-3xl mx-auto">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-blue-900 mb-2">
            Tentang Keamanan Login
          </h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Saat login, Google mungkin menampilkan peringatan &quot;unverified app&quot;. Ini normal untuk aplikasi baru. 
            Klik <strong>&quot;Continue&quot;</strong> atau <strong>&quot;Advanced → Go to Ovrica&quot;</strong> untuk melanjutkan. 
            Data kamu tetap aman dan terenkripsi.
          </p>
        </div>
      </div>
    </div>
  );
}
