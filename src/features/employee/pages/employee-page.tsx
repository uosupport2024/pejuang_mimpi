import { UserPlus } from "lucide-react";

export function EmployeePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Employee Management</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#e0542c] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#c84420] transition-colors cursor-pointer">
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-semibold">All (124)</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">Active (118)</span>
            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold">On Leave (6)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role / Department</th>
                <th className="py-3 px-4">Join Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="text-gray-800">
                <td className="py-4 px-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">OJB</div>
                  <div>
                    <p className="font-bold">Oliver John Brown</p>
                    <p className="text-[10px] text-gray-400 font-medium">oliver@gmail.com</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="font-bold">Senior Developer</p>
                  <p className="text-[10px] text-gray-400 font-medium">Engineering</p>
                </td>
                <td className="py-4 px-4 text-gray-500 font-medium">2 Dec 2024</td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px]">Active</span>
                </td>
              </tr>
              <tr className="text-gray-800">
                <td className="py-4 px-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">NJS</div>
                  <div>
                    <p className="font-bold">Noah James Smith</p>
                    <p className="text-[10px] text-gray-400 font-medium">noah@gmail.com</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="font-bold">UI Designer</p>
                  <p className="text-[10px] text-gray-400 font-medium">Design</p>
                </td>
                <td className="py-4 px-4 text-gray-500 font-medium">1 Dec 2024</td>
                <td className="py-4 px-4">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px]">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
