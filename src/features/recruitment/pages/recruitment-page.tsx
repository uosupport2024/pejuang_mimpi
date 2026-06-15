export function RecruitmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Recruitment Hub</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xs min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-[#e0542c]/10 flex items-center justify-center text-[#e0542c] mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Recruitment Hub Page</h2>
        <p className="text-sm text-gray-500 max-w-md">
          Manage job vacancies, candidates, and interview processes.
        </p>
      </div>
    </div>
  );
}
