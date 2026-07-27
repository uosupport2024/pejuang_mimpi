import { UserPlusRounded } from "@solar-icons/react";
import { ReusableTable } from "@/shared/components/ui/reusable-table";
import type { ColumnDef } from "@/shared/components/ui/reusable-table";
import { cn } from "@/shared/lib/utils";
import { createPortal } from "react-dom";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { type BackendEmployee } from "../api/employee";
import { ConfirmationModal } from "@/shared/components/ui/confirmation-modal";
import { useEmployee } from "../hooks/use-employee";
import { useState, useRef, useEffect } from "react";
import { MoreVertical, KeyRound, CalendarRange, SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";

interface EmployeeActionDropdownProps {
  employee: BackendEmployee;
  onDelete: (id: number, name: string) => void;
}

function EmployeeActionDropdown({ employee, onDelete }: EmployeeActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUpward: false });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 175; // Approx height of our menu dropdown
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top = rect.bottom + window.scrollY;
      let openUp = false;

      // If space below is not enough and space above is enough, open upwards
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = rect.top + window.scrollY - dropdownHeight - 4;
        openUp = true;
      } else {
        top = rect.bottom + window.scrollY + 4;
      }

      setCoords({
        top,
        left: rect.right + window.scrollX - 176, // 176px width (w-44 = 11rem = 176px)
        openUpward: openUp
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        // Do not close if clicking directly inside the portal menu
        !(event.target as HTMLElement).closest(".portal-dropdown-menu")
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      // Small timeout to ensure DOM layout is ready to read coordinates
      setTimeout(updateCoords, 0);
    }
    setIsOpen(!isOpen);
  };

  const { navigate } = useRouter();

  const handleAction = (actionName: string) => {
    setIsOpen(false);
    if (actionName === "delete") {
      onDelete(employee.id, employee.name);
    } else if (actionName === "Edit") {
      navigate("EmployeeEdit", { employeeId: employee.id });
    } else if (actionName === "Input Shift") {
      navigate("EmployeeInputShift", { employeeId: employee.id });
    } else {
      toast.info(`${actionName} untuk ${employee.name}`);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="p-1 text-gray-400 hover:text-gray-650 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && createPortal(
        <div
          style={{
            position: "absolute",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className={cn(
            "portal-dropdown-menu w-44 rounded-xl bg-white border border-gray-200 shadow-lg py-1 z-[9999] animate-in fade-in duration-100",
            coords.openUpward ? "origin-bottom-right" : "origin-top-right"
          )}
        >
          <button
            onClick={() => handleAction("Edit")}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-semibold"
          >
            <SquarePen size={14} className="text-gray-400" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => handleAction("Ganti Password")}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-semibold"
          >
            <KeyRound size={14} className="text-gray-400" />
            <span>Ganti Password</span>
          </button>
          <button
            onClick={() => handleAction("Input Shift")}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-semibold"
          >
            <CalendarRange size={14} className="text-gray-400" />
            <span>Input Shift</span>
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => handleAction("delete")}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-red-650 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent text-left font-semibold"
          >
            <Trash2 size={14} className="text-red-500" />
            <span>Delete</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

export function EmployeePage() {
  const { navigate } = useRouter();
  const {
    employees,
    loading,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    pageSize,
    handleDelete,
  } = useEmployee();

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: "",
  });
  const [deleting, setDeleting] = useState(false);

  const triggerDeleteConfirm = (id: number, name: string) => {
    setConfirmDelete({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      setDeleting(true);
      await handleDelete(confirmDelete.id);
      toast.success(`Pegawai "${confirmDelete.name}" berhasil dihapus.`);
      setConfirmDelete({ isOpen: false, id: null, name: "" });
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pegawai.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<BackendEmployee>[] = [
    {
      header: "No.",
      cell: (_, index) => (
        <span className="text-gray-500 font-medium">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      ),
      skeleton: () => <Skeleton className="h-3 w-4 mx-auto rounded" />,
      className: "w-12 text-center",
    },
    {
      header: "Nama",
      cell: (row) => (
        <div>
          <p className="font-bold text-gray-800 leading-tight">{row.name}</p>
          <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">{row.email}</p>
        </div>
      ),
      skeleton: () => (
        <div className="space-y-1 w-full max-w-[120px]">
          <Skeleton className="h-3.5 w-3/4 rounded" />
          <Skeleton className="h-2.5 w-1/2 rounded" />
        </div>
      ),
    },
    {
      header: "No. Telepon",
      cell: (row) => <span className="text-gray-600 font-medium">{row.telepon || "-"}</span>,
      skeleton: () => <Skeleton className="h-3.5 w-24 rounded" />,
    },
    {
      header: "Lokasi",
      cell: (row) => <span className="text-gray-600 font-medium">{row.lokasi?.nama_lokasi || "-"}</span>,
      skeleton: () => <Skeleton className="h-3.5 w-20 rounded" />,
    },
    {
      header: "Divisi",
      cell: (row) => <span className="text-gray-600 font-medium">{row.jabatan?.nama_jabatan || "-"}</span>,
      skeleton: () => <Skeleton className="h-3.5 w-16 rounded" />,
    },
    {
      header: "Role",
      cell: (row) => {
        const roleName = row.roles?.[0]?.name || row.is_admin || "user";
        return (
          <span className={cn(
            "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center justify-center text-white shadow-2xs",
            roleName === "admin"
              ? "bg-[#e0542c]"
              : roleName === "user"
                ? "bg-[#7FA46D]"
                : "bg-gray-500"
          )}>
            {roleName}
          </span>
        );
      },
      skeleton: () => <Skeleton className="h-5 w-12 rounded-md" />,
    },
    {
      header: "Aksi",
      cell: (row) => (
        <div className="flex items-center justify-center">
          <EmployeeActionDropdown employee={row} onDelete={triggerDeleteConfirm} />
        </div>
      ),
      skeleton: () => (
        <div className="flex items-center justify-center">
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
      ),
      className: "w-24 text-center",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Flat Table using ReusableTable built-in Search & Pagination */}
      <ReusableTable
        columns={columns}
        data={employees}
        loading={loading}
        className="border border-gray-200/80 shadow-xs"
        rowClassName="hover:bg-zinc-50/30"

        // Search config
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Cari pegawai..."

        // Add action button config
        addButtonText="Add Employee"
        addButtonIcon={<UserPlusRounded size={16} weight="Linear" />}
        onAddClick={() => navigate("EmployeeAdd")}

        // Pagination config
        showPagination={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: "" })}
        onConfirm={handleConfirmDelete}
        title="Hapus Pegawai"
        message={`Apakah Anda yakin ingin menghapus pegawai "${confirmDelete.name}"? Semua data yang terkait dengan pegawai ini akan terhapus.`}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}



