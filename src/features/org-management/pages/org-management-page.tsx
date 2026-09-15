import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Search, ScanEye, ChevronsUpDown, ChevronsDownUp, UserPlus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { THEME_COLORS } from "@/shared/constants/colors";
import { useRouter } from "@/shared/router/router";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import type { ColumnDef } from "@/shared/components/ui/reusable-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { fetchEmployees, type BackendEmployee } from "@/features/employee/api/employee";
import { fetchHierarchy, reassignManager, type HierarchyNode } from "../api/org-management";
import { OrgChartTree } from "../components/org-chart-tree";
import { ReassignManagerModal } from "../components/reassign-manager-modal";

const TABS = [
  { id: "chart", label: "Bagan Organisasi" },
  { id: "locations", label: "Lokasi & Divisi" },
  { id: "directory", label: "Direktori" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function abbreviate(name: string): string {
  return name.replace(/\s+/g, "").slice(0, 3).toUpperCase() || "-";
}

export function OrgManagementPage() {
  const { navigate } = useRouter();
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("chart");

  // Chart tab: search + filters + collapse state
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<number | null>(null);
  const [divisiFilter, setDivisiFilter] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const chartScrollRef = useRef<HTMLDivElement>(null);

  // Reassign-manager flow
  const [reassignTarget, setReassignTarget] = useState<HierarchyNode | null>(null);
  const [reassigning, setReassigning] = useState(false);

  // Directory tab
  const [directoryData, setDirectoryData] = useState<BackendEmployee[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryPage, setDirectoryPage] = useState(1);
  const [directoryTotalPages, setDirectoryTotalPages] = useState(1);
  const [directoryTotal, setDirectoryTotal] = useState(0);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryLokasiFilter, setDirectoryLokasiFilter] = useState<number | "">("");
  const [directoryJabatanFilter, setDirectoryJabatanFilter] = useState<number | "">("");

  const loadHierarchy = useCallback(() => {
    setLoading(true);
    fetchHierarchy()
      .then(setHierarchy)
      .catch((err: any) => toast.error(err.message || "Gagal memuat struktur organisasi"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadHierarchy();
  }, [loadHierarchy]);

  // ── Derived tree structures ──────────────────────────────────────────
  const nodeByContractId = useMemo(() => {
    const m = new Map<number, HierarchyNode>();
    hierarchy.forEach((n) => m.set(n.contract_id, n));
    return m;
  }, [hierarchy]);

  const childrenMap = useMemo(() => {
    const m = new Map<number, HierarchyNode[]>();
    hierarchy.forEach((n) => {
      if (n.manager_contract_id != null) {
        const arr = m.get(n.manager_contract_id) || [];
        arr.push(n);
        m.set(n.manager_contract_id, arr);
      }
    });
    return m;
  }, [hierarchy]);

  // A null-manager node is a chart root if it actually leads people;
  // otherwise it's an orphan with nowhere logical to render and drops to
  // the Unassigned tray instead.
  const roots = useMemo(
    () => hierarchy.filter((n) => n.manager_contract_id == null && n.direct_report_count > 0),
    [hierarchy]
  );
  const unassigned = useMemo(
    () => hierarchy.filter((n) => n.manager_contract_id == null && n.direct_report_count === 0),
    [hierarchy]
  );

  const crossSiteIds = useMemo(() => {
    const s = new Set<number>();
    hierarchy.forEach((n) => {
      if (n.manager_contract_id != null) {
        const mgr = nodeByContractId.get(n.manager_contract_id);
        if (mgr && n.lokasi && mgr.lokasi && n.lokasi.id !== mgr.lokasi.id) {
          s.add(n.contract_id);
        }
      }
    });
    return s;
  }, [hierarchy, nodeByContractId]);

  const siteOptions = useMemo(() => {
    const counts = new Map<number, { nama_lokasi: string; count: number }>();
    hierarchy.forEach((n) => {
      if (n.lokasi) {
        const cur = counts.get(n.lokasi.id) || { nama_lokasi: n.lokasi.nama_lokasi, count: 0 };
        cur.count += 1;
        counts.set(n.lokasi.id, cur);
      }
    });
    return Array.from(counts.entries()).map(([id, v]) => ({ id, ...v }));
  }, [hierarchy]);

  const divisiOptions = useMemo(() => {
    const counts = new Map<number, { nama_jabatan: string; count: number }>();
    hierarchy.forEach((n) => {
      if (n.jabatan) {
        const cur = counts.get(n.jabatan.id) || { nama_jabatan: n.jabatan.nama_jabatan, count: 0 };
        cur.count += 1;
        counts.set(n.jabatan.id, cur);
      }
    });
    return Array.from(counts.entries()).map(([id, v]) => ({ id, ...v }));
  }, [hierarchy]);

  // One card per location, each broken down by division within that
  // location — feeds the "Lokasi & Divisi" tab.
  const locationCards = useMemo(() => {
    const byLocation = new Map<
      number,
      { nama_lokasi: string; total: number; divisions: Map<number, { nama_jabatan: string; count: number }> }
    >();
    hierarchy.forEach((n) => {
      if (!n.lokasi) return;
      const entry = byLocation.get(n.lokasi.id) || {
        nama_lokasi: n.lokasi.nama_lokasi,
        total: 0,
        divisions: new Map<number, { nama_jabatan: string; count: number }>(),
      };
      entry.total += 1;
      if (n.jabatan) {
        const d = entry.divisions.get(n.jabatan.id) || { nama_jabatan: n.jabatan.nama_jabatan, count: 0 };
        d.count += 1;
        entry.divisions.set(n.jabatan.id, d);
      }
      byLocation.set(n.lokasi.id, entry);
    });
    return Array.from(byLocation.entries())
      .map(([id, v]) => ({
        id,
        nama_lokasi: v.nama_lokasi,
        total: v.total,
        divisions: Array.from(v.divisions.entries())
          .map(([did, dv]) => ({ id: did, ...dv }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.total - a.total);
  }, [hierarchy]);

  // Search/site/divisi all feed the SAME highlight mechanism (rather than
  // pruning the tree) so a filtered-out branch never breaks connector
  // lines to its still-visible siblings — matches are highlighted and
  // their whole ancestor chain is force-expanded so they're reachable.
  const { highlightIds, forceExpandIds } = useMemo(() => {
    const highlight = new Set<number>();
    const forceExpand = new Set<number>();
    const q = search.trim().toLowerCase();
    const hasFilter = q.length > 0 || siteFilter != null || divisiFilter != null;
    if (!hasFilter) return { highlightIds: highlight, forceExpandIds: forceExpand };

    hierarchy.forEach((n) => {
      const matchesQuery =
        q.length === 0 || (n.name || "").toLowerCase().includes(q) || (n.username || "").toLowerCase().includes(q);
      const matchesSite = siteFilter == null || n.lokasi?.id === siteFilter;
      const matchesDivisi = divisiFilter == null || n.jabatan?.id === divisiFilter;
      if (matchesQuery && matchesSite && matchesDivisi) {
        highlight.add(n.contract_id);
        let cur: number | null = n.manager_contract_id;
        while (cur != null) {
          forceExpand.add(cur);
          const parent: HierarchyNode | undefined = nodeByContractId.get(cur);
          cur = parent ? parent.manager_contract_id : null;
        }
      }
    });
    return { highlightIds: highlight, forceExpandIds: forceExpand };
  }, [hierarchy, search, siteFilter, divisiFilter, nodeByContractId]);

  const handleToggleCollapse = useCallback((contractId: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(contractId)) next.delete(contractId);
      else next.add(contractId);
      return next;
    });
  }, []);

  const handleCollapseAll = () => {
    setCollapsed(new Set(hierarchy.filter((n) => n.direct_report_count > 0).map((n) => n.contract_id)));
  };
  const handleExpandAll = () => setCollapsed(new Set());

  const handleCenter = () => {
    if (highlightIds.size > 0) {
      const firstId = Array.from(highlightIds)[0];
      document.getElementById(`org-node-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      return;
    }
    const container = chartScrollRef.current;
    if (!container) return;
    container.scrollTo({ left: (container.scrollWidth - container.clientWidth) / 2, top: 0, behavior: "smooth" });
  };

  // ── Reassign manager flow ────────────────────────────────────────────
  const descendantIds = useCallback(
    (contractId: number): Set<number> => {
      const result = new Set<number>();
      const walk = (id: number) => {
        (childrenMap.get(id) || []).forEach((child) => {
          result.add(child.contract_id);
          walk(child.contract_id);
        });
      };
      walk(contractId);
      return result;
    },
    [childrenMap]
  );

  const reassignOptions = useMemo(() => {
    if (!reassignTarget) return [];
    const excluded = descendantIds(reassignTarget.contract_id);
    excluded.add(reassignTarget.contract_id);
    return hierarchy
      .filter((n) => !excluded.has(n.contract_id))
      .map((n) => ({ value: String(n.contract_id), label: `${n.name || "-"} — ${n.jabatan?.nama_jabatan || "-"}` }));
  }, [reassignTarget, hierarchy, descendantIds]);

  const handleConfirmReassign = async (managerContractId: number | null) => {
    if (!reassignTarget) return;
    setReassigning(true);
    try {
      await reassignManager(reassignTarget.contract_id, managerContractId);
      toast.success(`Atasan ${reassignTarget.name} berhasil diperbarui.`);
      setReassignTarget(null);
      loadHierarchy();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah atasan.");
    } finally {
      setReassigning(false);
    }
  };

  // ── Directory tab ────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "directory") return;
    setDirectoryLoading(true);
    fetchEmployees({
      q: directorySearch || undefined,
      page: directoryPage,
      per_page: 10,
      lokasi_id: directoryLokasiFilter || undefined,
      jabatan_id: directoryJabatanFilter || undefined,
    })
      .then((res) => {
        setDirectoryData(res.data);
        setDirectoryTotalPages(res.last_page);
        setDirectoryTotal(res.total);
      })
      .catch((err: any) => toast.error(err.message || "Gagal memuat direktori pegawai"))
      .finally(() => setDirectoryLoading(false));
  }, [activeTab, directorySearch, directoryPage, directoryLokasiFilter, directoryJabatanFilter]);

  const managerNameByUserId = useMemo(() => {
    const m = new Map<number, string>();
    hierarchy.forEach((n) => {
      if (n.manager_contract_id != null) {
        const mgr = nodeByContractId.get(n.manager_contract_id);
        if (mgr) m.set(n.user_id, mgr.name || "-");
      }
    });
    return m;
  }, [hierarchy, nodeByContractId]);

  const golonganNameByUserId = useMemo(() => {
    const m = new Map<number, string>();
    hierarchy.forEach((n) => {
      if (n.golongan) m.set(n.user_id, n.golongan.name);
    });
    return m;
  }, [hierarchy]);

  const directoryColumns: ColumnDef<BackendEmployee>[] = [
    {
      header: "Nama",
      accessorKey: "name",
      cell: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-gray-800 leading-tight truncate">{row.name}</p>
          <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5 truncate">@{row.username}</p>
        </div>
      ),
    },
    { header: "Divisi", cell: (row) => <span className="text-gray-600 font-medium">{row.jabatan?.nama_jabatan || "-"}</span>, sortable: false },
    {
      header: "Posisi",
      cell: (row) => <span className="text-gray-600 font-medium">{golonganNameByUserId.get(row.id) || ""}</span>,
      sortable: false,
    },
    { header: "Lokasi", cell: (row) => <span className="text-gray-600 font-medium">{row.lokasi?.nama_lokasi || "-"}</span>, sortable: false },
    { header: "Email", accessorKey: "email", cell: (row) => <span className="text-gray-600 font-medium">{row.email}</span> },
    { header: "Telepon", accessorKey: "telepon", cell: (row) => <span className="text-gray-600 font-medium">{row.telepon || "-"}</span> },
    {
      header: "Atasan",
      cell: (row) => <span className="text-gray-600 font-medium">{managerNameByUserId.get(row.id) || "-"}</span>,
      sortable: false,
    },
  ];

  const goToDirectory = (filters: { lokasi_id?: number; jabatan_id?: number }) => {
    setDirectoryLokasiFilter(filters.lokasi_id ?? "");
    setDirectoryJabatanFilter(filters.jabatan_id ?? "");
    setDirectoryPage(1);
    setActiveTab("directory");
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6">
        <h2 className="text-lg font-bold text-gray-800">Manajemen Organisasi</h2>
        <p className="text-xs text-gray-500 mt-1">Lihat struktur pelaporan pegawai, kelola lokasi & divisi, dan cari pegawai lewat direktori.</p>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none gap-2 bg-white px-4 py-1.5 rounded-xl shadow-xs border border-gray-200/80">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id ? { color: THEME_COLORS.hex.primary, borderColor: THEME_COLORS.hex.primary } : undefined}
            className={cn(
              "px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer",
              activeTab === tab.id ? "" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "chart" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau username..."
                  className="w-full h-9 pl-8 pr-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] text-gray-700 font-medium"
                />
              </div>
              <select
                value={divisiFilter ?? ""}
                onChange={(e) => setDivisiFilter(e.target.value ? Number(e.target.value) : null)}
                className="h-9 px-3 text-xs bg-zinc-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#e0542c]"
              >
                <option value="">Semua Divisi</option>
                {divisiOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_jabatan} ({d.count})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={handleCenter} className="h-9 px-3 text-xs font-bold text-gray-600 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <ScanEye size={14} /> Pusatkan
                </button>
                <button type="button" onClick={handleCollapseAll} className="h-9 px-3 text-xs font-bold text-gray-600 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <ChevronsDownUp size={14} /> Tutup Semua
                </button>
                <button type="button" onClick={handleExpandAll} className="h-9 px-3 text-xs font-bold text-gray-600 bg-zinc-100 hover:bg-zinc-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <ChevronsUpDown size={14} /> Buka Semua
                </button>
              </div>
            </div>

            {siteOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Lokasi</span>
                <button
                  type="button"
                  onClick={() => setSiteFilter(null)}
                  style={siteFilter === null ? { backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary } : undefined}
                  className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer", siteFilter === null ? "" : "bg-zinc-100 text-gray-600 hover:bg-zinc-200/80")}
                >
                  Semua
                </button>
                {siteOptions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSiteFilter(siteFilter === s.id ? null : s.id)}
                    style={siteFilter === s.id ? { backgroundColor: `${THEME_COLORS.hex.primary}1A`, color: THEME_COLORS.hex.primary } : undefined}
                    className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer", siteFilter === s.id ? "" : "bg-zinc-100 text-gray-600 hover:bg-zinc-200/80")}
                  >
                    {s.nama_lokasi} <span className="opacity-60">{s.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={chartScrollRef} className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-8 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-[220px] rounded-xl" />
                ))}
              </div>
            ) : (
              <OrgChartTree
                roots={roots}
                childrenMap={childrenMap}
                collapsed={collapsed}
                onToggleCollapse={handleToggleCollapse}
                highlightIds={highlightIds}
                forceExpandIds={forceExpandIds}
                crossSiteIds={crossSiteIds}
                onReassign={setReassignTarget}
              />
            )}
          </div>

          {!loading && unassigned.length > 0 && (
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">
                  BELUM PUNYA ATASAN {unassigned.length}
                </span>
                <p className="text-[11px] text-gray-500">Kontrak tanpa atasan — tetapkan satu untuk menempatkannya di bagan.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {unassigned.map((n) => (
                  <button
                    key={n.contract_id}
                    type="button"
                    onClick={() => setReassignTarget(n)}
                    className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-700">{n.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {n.jabatan?.nama_jabatan || "-"}
                        {n.golongan && ` · ${n.golongan.name}`}
                      </p>
                      {n.lokasi && (
                        <span className="inline-flex items-center px-1 py-px mt-0.5 rounded text-[9px] font-bold bg-zinc-100 text-gray-500">
                          {abbreviate(n.lokasi.nama_lokasi)}
                        </span>
                      )}
                    </div>
                    <UserPlus size={13} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "locations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {locationCards.length === 0 ? (
            <div className="col-span-full bg-white border border-gray-200/80 rounded-2xl shadow-xs p-10 text-center">
              <p className="text-xs text-gray-400">Belum ada data lokasi.</p>
            </div>
          ) : (
            locationCards.map((loc) => (
              <div key={loc.id} className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-800 leading-tight">{loc.nama_lokasi}</h3>
                  <span
                    style={{ backgroundColor: THEME_COLORS.hex.navBg }}
                    className="shrink-0 px-2 py-1 rounded-md text-[10px] font-black text-white tracking-wide"
                  >
                    {abbreviate(loc.nama_lokasi)}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-gray-800 leading-none">{loc.total}</span>
                  <span className="text-xs text-gray-500 font-medium">kontrak aktif</span>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2.5">
                  {loc.divisions.length === 0 ? (
                    <p className="text-[11px] text-gray-400">Belum ada divisi tercatat di lokasi ini.</p>
                  ) : (
                    loc.divisions.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            style={{ color: THEME_COLORS.hex.primary }}
                            className="text-[10px] font-black shrink-0 w-7"
                          >
                            {abbreviate(d.nama_jabatan)}
                          </span>
                          <span className="text-xs font-semibold text-gray-700 truncate">{d.nama_jabatan}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium shrink-0">{d.count}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate("Location")}
                    className="flex-1 h-8 text-[11px] font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-gray-600 transition-colors cursor-pointer"
                  >
                    Kelola Lokasi
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("Organization")}
                    className="flex-1 h-8 text-[11px] font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200/80 text-gray-600 transition-colors cursor-pointer"
                  >
                    Kelola Divisi
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => goToDirectory({ lokasi_id: loc.id })}
                  style={{ color: THEME_COLORS.hex.primary }}
                  className="w-full text-[11px] font-bold text-center cursor-pointer hover:opacity-80"
                >
                  Lihat di Direktori →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "directory" && (
        <ReusableTable
          columns={directoryColumns}
          data={directoryData}
          loading={directoryLoading}
          showSearch
          searchQuery={directorySearch}
          onSearchChange={(q) => {
            setDirectorySearch(q);
            setDirectoryPage(1);
          }}
          searchPlaceholder="Cari nama, username, email, telepon..."
          showPagination
          currentPage={directoryPage}
          totalPages={directoryTotalPages}
          totalItems={directoryTotal}
          itemsPerPage={10}
          onPageChange={setDirectoryPage}
          emptyMessage="Tidak ada pegawai yang cocok."
        />
      )}

      {reassignTarget && (
        <ReassignManagerModal
          target={reassignTarget}
          currentManagerName={
            reassignTarget.manager_contract_id != null
              ? nodeByContractId.get(reassignTarget.manager_contract_id)?.name || null
              : null
          }
          options={reassignOptions}
          submitting={reassigning}
          onCancel={() => setReassignTarget(null)}
          onConfirm={handleConfirmReassign}
        />
      )}
    </div>
  );
}
