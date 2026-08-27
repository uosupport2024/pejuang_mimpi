import type { Celengan, CelenganTransaction } from "../types/celengan";
import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";

export async function fetchCelengans(): Promise<Celengan[]> {
  const response = await dedupFetch(`${API_BASE_URL}/celengan`, {
    method: "GET",
    headers: getHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to fetch celengans");
  if (json.code === 200 && Array.isArray(json.data)) {
    return json.data.map((c: any) => ({
      ...c,
      target_amount: Number(c.target_amount),
      current_amount: Number(c.current_amount),
    }));
  }
  throw new Error(json.message || "Invalid response format");
}

export async function createCelengan(name: string, targetAmount: number, icon: string): Promise<Celengan> {
  const response = await fetch(`${API_BASE_URL}/celengan`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name, target_amount: targetAmount, icon }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to create celengan");
  if (json.code === 201 || json.code === 200) {
    return {
      ...json.data,
      target_amount: Number(json.data.target_amount),
      current_amount: Number(json.data.current_amount),
    };
  }
  throw new Error(json.message || "Failed to create celengan");
}

export async function updateCelengan(id: number, name: string, targetAmount: number, icon: string): Promise<Celengan> {
  const response = await fetch(`${API_BASE_URL}/celengan/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ name, target_amount: targetAmount, icon }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to update celengan");
  if (json.code === 200) {
    return {
      ...json.data,
      target_amount: Number(json.data.target_amount),
      current_amount: Number(json.data.current_amount),
    };
  }
  throw new Error(json.message || "Failed to update");
}

export async function deleteCelengan(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/celengan/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to delete");
  return json.code === 200;
}

export async function depositCelengan(id: number, amount: number, note?: string): Promise<{ celengan: Celengan; transaction: CelenganTransaction }> {
  const response = await fetch(`${API_BASE_URL}/celengan/${id}/deposit`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ amount, note }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to deposit");
  if (json.code === 200) {
    return {
      celengan: {
        ...json.data.celengan,
        target_amount: Number(json.data.celengan.target_amount),
        current_amount: Number(json.data.celengan.current_amount),
      },
      transaction: json.data.transaction,
    };
  }
  throw new Error(json.message || "Deposit failed");
}

export async function withdrawCelengan(id: number, amount: number, note?: string): Promise<{ celengan: Celengan; transaction: CelenganTransaction }> {
  const response = await fetch(`${API_BASE_URL}/celengan/${id}/withdraw`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ amount, note }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to withdraw");
  if (json.code === 200) {
    return {
      celengan: {
        ...json.data.celengan,
        target_amount: Number(json.data.celengan.target_amount),
        current_amount: Number(json.data.celengan.current_amount),
      },
      transaction: json.data.transaction,
    };
  }
  throw new Error(json.message || "Withdraw failed");
}

export async function fetchCelenganHistory(id: number): Promise<CelenganTransaction[]> {
  const response = await dedupFetch(`${API_BASE_URL}/celengan/${id}/history`, {
    method: "GET",
    headers: getHeaders(),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Failed to fetch history");
  if (json.code === 200 && Array.isArray(json.data)) {
    return json.data.map((t: any) => ({
      ...t,
      amount: Number(t.amount),
    }));
  }
  throw new Error(json.message || "Invalid history response");
}
