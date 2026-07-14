import { useState, useEffect, useRef } from "react";
import { fetchEmployees, deleteEmployee, type BackendEmployee } from "../api/employee";
import { toast } from "sonner";

export function useEmployee() {
  const [employees, setEmployees] = useState<BackendEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const isFirstRender = useRef(true);

  // Debounce search query
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedSearchQuery((prev) => (prev === searchQuery ? prev : searchQuery));
      setCurrentPage((prev) => (prev === 1 ? prev : 1));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadData = (isMounted = true) => {
    setLoading(true);
    fetchEmployees({
      q: debouncedSearchQuery,
      page: currentPage,
      per_page: pageSize,
    })
      .then((res) => {
        if (!isMounted) return;
        setEmployees(res.data || []);
        setTotalItems(res.total || 0);
        setTotalPages(res.last_page || 1);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        toast.error("Gagal mengambil data pegawai dari server.");
        setLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;
    loadData(isMounted);
    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedSearchQuery]);

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);
    loadData(true);
  };

  return {
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
    loadData,
  };
}
