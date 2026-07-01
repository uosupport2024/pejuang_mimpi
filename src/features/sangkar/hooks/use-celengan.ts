import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "@/shared/router/router";
import type { Celengan, CelenganTransaction } from "../types/celengan";
import {
  fetchCelengans,
  fetchCelenganHistory,
  createCelengan,
  depositCelengan,
  withdrawCelengan,
  deleteCelengan
} from "../api/celengan";

export function useCelengans() {
  const [celengans, setCelengans] = useState<Celengan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCelengans();
      setCelengans(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data celengan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    celengans,
    loading,
    refresh: loadData
  };
}

export function useCelenganDetail(idParam: string | null, typeParam: string | null) {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [celengan, setCelengan] = useState<Celengan | null>(null);
  const [history, setHistory] = useState<CelenganTransaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const list = await fetchCelengans();
      let selected: Celengan | undefined;

      if (idParam) {
        selected = list.find((c) => c.id === Number(idParam));
      }

      if (!selected && typeParam) {
        selected = list.find((c) => c.name.toLowerCase() === typeParam.toLowerCase() || c.icon === typeParam);
      }

      if (!selected) {
        selected = list[0];
      }

      if (selected) {
        setCelengan(selected);
        const histData = await fetchCelenganHistory(selected.id);
        setHistory(histData);
      } else {
        setCelengan(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat detail celengan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [idParam, typeParam]);

  const deposit = async (amount: number, note?: string) => {
    if (!celengan) return;
    try {
      setIsSubmitting(true);
      const res = await depositCelengan(celengan.id, amount, note);
      setCelengan(res.celengan);
      const histData = await fetchCelenganHistory(celengan.id);
      setHistory(histData);
      return res;
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan deposit.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const withdraw = async (amount: number, note?: string) => {
    if (!celengan) return;
    try {
      setIsSubmitting(true);
      const res = await withdrawCelengan(celengan.id, amount, note);
      setCelengan(res.celengan);
      const histData = await fetchCelenganHistory(celengan.id);
      setHistory(histData);
      return res;
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan penarikan.");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async () => {
    if (!celengan) return;
    try {
      setLoading(true);
      await deleteCelengan(celengan.id);
      toast.success("Celengan berhasil dihapus.");
      navigate("MobileHome");
    } catch (err) {
      toast.error("Gagal menghapus celengan.");
      setLoading(false);
      throw err;
    }
  };

  return {
    celengan,
    history,
    loading,
    isSubmitting,
    deposit,
    withdraw,
    remove,
    refresh: loadDetail
  };
}

export function useAddCelengan() {
  const { navigate } = useRouter();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [icon, setIcon] = useState("rumah");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const amountNum = parseFloat(targetAmount);
    if (!name.trim()) {
      toast.error("Nama celengan tidak boleh kosong!");
      return false;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Masukkan nominal target yang valid!");
      return false;
    }

    try {
      setIsSubmitting(true);
      await createCelengan(name.trim(), amountNum, icon);
      toast.success("Celengan baru berhasil dibuat!");
      navigate("MobileHome");
      return true;
    } catch (error) {
      toast.error("Gagal membuat celengan.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    targetAmount,
    setTargetAmount,
    icon,
    setIcon,
    isSubmitting,
    submit
  };
}
