import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Calendar,
  ChevronDown,
  Search
} from "lucide-react";

export function DashboardPage() {
  const statCards = [
    {
      title: "Total Sales",
      value: "2500",
      change: "+ 4.9%",
      isPositive: true,
      subtext: "Last month: 2345",
      icon: ShoppingCart,
    },
    {
      title: "New Customer",
      value: "110",
      change: "↑ 7.5%",
      isPositive: true,
      subtext: "Last month: 89",
      icon: Users,
    },
    {
      title: "Return Products",
      value: "72",
      change: "↓ 6.0%",
      isPositive: false,
      subtext: "Last month: 60",
      icon: Package,
    },
    {
      title: "Total Revenue",
      value: "$8,220.64",
      change: null,
      isPositive: true,
      subtext: "Last month: $620.00",
      icon: DollarSign,
    },
  ];

  return (
    <>
      {/* Sales Overview Title & Date range picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Sales Overview
        </h1>
        <button className="flex items-center gap-2.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-gray-400" />
          April 10, 2026 - May 11, 2026
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-5 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400">{card.title}</span>
                <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2.5">
                <span className="text-2xl font-extrabold text-gray-950 tracking-tight">{card.value}</span>
                {card.change && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${card.isPositive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-rose-500/10 text-rose-600"
                    }`}>
                    {card.change}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-medium mt-1.5 block">
                {card.subtext}
              </span>
            </div>
          );
        })}
      </div>

      {/* Middle Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Revenue analytics (2/3 width) */}
        <div className="lg:col-span-7 p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-xs relative">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-gray-900">Revenue analytics</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 cursor-pointer">
              This Week
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Vector Bar Chart */}
          <div className="relative h-48 w-full flex items-end justify-between pt-8 pb-2 border-b border-gray-100">
            {/* Horizontal gridlines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-gray-400">
              <div className="border-b border-dashed border-gray-100 w-full pt-1.5 flex justify-between"><span>30k</span><div className="w-full"></div></div>
              <div className="border-b border-dashed border-gray-100 w-full pt-1.5 flex justify-between"><span>25k</span><div className="w-full"></div></div>
              <div className="border-b border-dashed border-gray-100 w-full pt-1.5 flex justify-between"><span>20k</span><div className="w-full"></div></div>
              <div className="border-b border-dashed border-gray-100 w-full pt-1.5 flex justify-between"><span>15k</span><div className="w-full"></div></div>
              <div className="border-b border-dashed border-gray-100 w-full pt-1.5 flex justify-between"><span>10k</span><div className="w-full"></div></div>
              <div className="border-b border-dashed border-gray-100 w-full pt-1.5 flex justify-between"><span>5k</span><div className="w-full"></div></div>
              <div className="flex justify-between"><span>0k</span><div className="w-full"></div></div>
            </div>

            {/* Highlight Tooltip for Sun */}
            <div className="absolute top-1 left-[32%] -translate-x-1/2 z-10 px-2 py-1 bg-[#e0542c] text-white text-[9px] font-bold rounded-lg shadow-md">
              $22,430
              <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#e0542c] rotate-45"></div>
            </div>

            {/* Vertical Bars */}
            {[
              { day: "Fri", height: "60%" },
              { day: "Sat", height: "45%" },
              { day: "Sun", height: "80%", highlight: true },
              { day: "Mon", height: "45%" },
              { day: "Thu", height: "55%" },
              { day: "Wen", height: "82%" },
              { day: "Thus", height: "60%" },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 z-10 w-[10%]">
                <div
                  style={{ height: bar.height }}
                  className={`w-6 rounded-t-lg transition-all ${bar.highlight
                      ? "bg-[#e0542c]"
                      : "bg-[#e0542c]/50 hover:bg-[#e0542c]/80"
                    }`}
                ></div>
              </div>
            ))}
          </div>

          {/* X Axis labels */}
          <div className="flex justify-between px-2 pt-2 text-[10px] font-bold text-gray-400">
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
            <span>Mon</span>
            <span>Thu</span>
            <span>Wen</span>
            <span>Thus</span>
          </div>
        </div>

        {/* Chart 2: Total Income (1/3 width) */}
        <div className="lg:col-span-5 p-6 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Total Income</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">View your income in a certain period of time</p>
              </div>
            </div>

            {/* Legends */}
            <div className="flex gap-4 mt-4 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#e0542c]"></span> Profit
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-black"></span> Loss
              </span>
            </div>
          </div>

          {/* Stacked Bar Graphics */}
          <div className="relative h-36 w-full flex items-end justify-between pt-2 border-b border-gray-100 mt-4">
            {[
              { month: "Jan", profit: 24, loss: 12 },
              { month: "Feb", profit: 28, loss: 10 },
              { month: "Mar", profit: 32, loss: 8 },
              { month: "Apr", profit: 22, loss: 14 },
              { month: "May", profit: 26, loss: 11 },
              { month: "Jun", profit: 36, loss: 6 },
              { month: "Jul", profit: 30, loss: 9 },
              { month: "Aug", profit: 22, loss: 12 },
            ].map((bar, i) => {
              const total = bar.profit + bar.loss;
              const profitPct = (bar.profit / total) * 100;
              const lossPct = (bar.loss / total) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-1 w-[8%] h-full justify-end">
                  <div className="w-4 flex flex-col rounded-t-xs overflow-hidden h-full justify-end" style={{ height: `${total * 2.5}px` }}>
                    <div className="bg-[#e0542c] w-full" style={{ height: `${profitPct}%` }}></div>
                    <div className="bg-black w-full" style={{ height: `${lossPct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* X Axis Month Labels */}
          <div className="flex justify-between px-1 pt-2 text-[9px] font-bold text-gray-400">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-sm font-bold text-gray-900">Recent orders</h3>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Table search bar */}
            <div className="relative w-40 sm:w-48">
              <Search className="absolute left-3 inset-y-0 my-auto w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-gray-200 rounded-full text-[10px] placeholder:text-gray-400 text-gray-800 focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-50 cursor-pointer">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              Sort by
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Table data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400">
                <th className="py-3 px-4"><input type="checkbox" className="rounded" /></th>
                <th className="py-3 px-4">Order Id</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* Row 1 */}
              <tr className="text-gray-800">
                <td className="py-4 px-4"><input type="checkbox" className="rounded" /></td>
                <td className="py-4 px-4 text-[#e0542c]">#878909</td>
                <td className="py-4 px-4 text-gray-500 font-medium">2 Dec 2026</td>
                <td className="py-4 px-4">Oliver John Brown</td>
                <td className="py-4 px-4 text-gray-500 font-medium">Shoes, Shirt</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px]">
                    Pending
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-500 font-medium font-mono">2 Items</td>
                <td className="py-4 px-4 text-right font-bold">$789.00</td>
              </tr>

              {/* Row 2 */}
              <tr className="text-gray-800">
                <td className="py-4 px-4"><input type="checkbox" className="rounded" /></td>
                <td className="py-4 px-4 text-[#e0542c]">#878909</td>
                <td className="py-4 px-4 text-gray-500 font-medium">1 Dec 2026</td>
                <td className="py-4 px-4">Noah James Smith</td>
                <td className="py-4 px-4 text-gray-500 font-medium">Sneakers, T-shirt</td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px]">
                    Completed
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-500 font-medium font-mono">3 Items</td>
                <td className="py-4 px-4 text-right font-bold">$967.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
