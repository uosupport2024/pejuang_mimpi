import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "../../../shared/router/router";

export function useSarang() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { navigate } = useRouter();

  const toggleDetails = useCallback(() => {
    setIsDetailsOpen((prev) => !prev);
  }, []);

  const handleMenuClick = useCallback((menuName: string) => {
    toast.info(`Membuka menu ${menuName}...`);
  }, []);

  const goBack = useCallback(() => {
    navigate("MobileHome");
  }, [navigate]);

  return {
    isDetailsOpen,
    toggleDetails,
    handleMenuClick,
    goBack,
  };
}
