import { API_BASE_URL, getHeaders, dedupFetch } from "@/shared/utils/api";

export type ChunkType = "video" | "audio" | "image_step" | "quiz" | "text";

export interface ChunkQuizOption {
  id?: number;
  quiz_id?: number;
  options: string;
  is_true?: boolean;
}

export interface ChunkDetail {
  id?: number;
  chunk_id?: number;
  video_url?: string;
  audio_url?: string;
  image_url?: string;
  duration_second?: number;
  transcript?: string;
  auto_play?: boolean;
  captions?: string;
  question?: string;
  options?: ChunkQuizOption[];
  title?: string;
  description?: string;
}

export interface LessonChunk {
  id: number;
  lesson_id: number;
  chunk_type: ChunkType;
  created_at?: string;
  updated_at?: string;
  detail?: ChunkDetail;
}

export interface Lesson {
  id: number;
  course_id?: number;
  title: string;
  icon_url?: string | null;
  order_index?: number;
  lesson_points?: number;
  created_at?: string;
  updated_at?: string;
  chunks_count?: number;
  chunks?: LessonChunk[];
  seen_status?: "completed" | "in_progress" | "not_started";
}

export interface Course {
  id: number;
  user_id?: number;
  title: string;
  thumbnail_url?: string | null;
  icon_url?: string | null;
  description?: string | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  lessons_count?: number;
  lessons?: Lesson[];
  progress?: any;
  difficulty?: string;
  tags?: string[] | null;
  user_progress?: {
    id: number;
    user_id: number;
    course_id: number;
    status: "in_progress" | "completed";
    percentage_completed: number;
    total_point: number;
    completed_at?: string | null;
  } | null;
  requirement_status?: any;
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  thumbnail_url?: string;
  icon_url?: string;
  is_published?: boolean;
  difficulty?: string;
  tags?: string[];
}

export interface CreateCourseFullPayload {
  title: string;
  description?: string;
  thumbnail_url?: string;
  icon_url?: string;
  is_published?: boolean;
  difficulty?: string;
  tags?: string[];
  lessons: {
    title: string;
    icon_url?: string;
    order_index?: number;
    lesson_points?: number;
  }[];
}

export interface UpdateCoursePayload {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  icon_url?: string;
  is_published?: boolean;
  difficulty?: string;
  tags?: string[];
}

export interface CreateLessonPayload {
  title: string;
  icon_url?: string;
  order_index?: number;
  lesson_points?: number;
}

export interface UpdateLessonPayload {
  title?: string;
  icon_url?: string;
  order_index?: number;
  lesson_points?: number;
}

export interface CreateChunkPayload {
  chunk_type: ChunkType;
  video_url?: string;
  audio_url?: string;
  image_url?: string;
  duration_second?: number;
  transcript?: string;
  auto_play?: boolean;
  captions?: string;
  question?: string;
  options?: { options: string; is_true?: boolean }[];
  title?: string;
  description?: string;
}

export interface UpdateChunkPayload {
  video_url?: string;
  audio_url?: string;
  image_url?: string;
  duration_second?: number;
  transcript?: string;
  auto_play?: boolean;
  captions?: string;
  question?: string;
  title?: string;
  description?: string;
}

export interface PaginatedCourseResponse {
  data: Course[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  stats?: {
    total: number;
    published: number;
    draft: number;
  };
}

let fetchCoursesPromiseMap = new Map<string, Promise<PaginatedCourseResponse>>();

export async function fetchCourses(
  page: number = 1,
  perPage: number = 10,
  query?: string,
  status?: "published" | "draft" | "all"
): Promise<PaginatedCourseResponse> {
  const cacheKey = `${page}_${perPage}_${query || ""}_${status || "all"}`;

  if (fetchCoursesPromiseMap.has(cacheKey)) {
    return fetchCoursesPromiseMap.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const url = new URL(`${API_BASE_URL}/courses`);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("per_page", perPage.toString());
      if (query) {
        url.searchParams.append("q", query);
      }
      if (status && status !== "all") {
        url.searchParams.append("status", status);
      }

      const response = await dedupFetch(url.toString(), {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Gagal mengambil data course");
      }

      const result = await response.json();
      const rawData = result.data || {};

      if (Array.isArray(rawData)) {
        return {
          data: rawData,
          current_page: 1,
          last_page: 1,
          per_page: rawData.length,
          total: rawData.length,
        };
      }

      return {
        data: Array.isArray(rawData.data) ? rawData.data : [],
        current_page: rawData.current_page || 1,
        last_page: rawData.last_page || 1,
        per_page: rawData.per_page || perPage,
        total: rawData.total || 0,
        stats: rawData.stats,
      };
    } finally {
      setTimeout(() => {
        fetchCoursesPromiseMap.delete(cacheKey);
      }, 300);
    }
  })();

  fetchCoursesPromiseMap.set(cacheKey, promise);
  return promise;
}

export async function fetchCourseById(id: number): Promise<Course> {
  const response = await dedupFetch(`${API_BASE_URL}/courses/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal mengambil detail course");
  }

  const result = await response.json();
  return result.data || result;
}

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal membuat course baru");
  }

  const result = await response.json();
  return result.data || result;
}

export async function createCourseFull(payload: CreateCourseFullPayload): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses/full`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal membuat course beserta materi");
  }

  const result = await response.json();
  const createdCourse = result.data || result;

  if (payload.is_published && createdCourse.id) {
    await updateCourse(createdCourse.id, { is_published: true }).catch(() => null);
  }

  return createdCourse;
}

export async function updateCourse(id: number, payload: UpdateCoursePayload): Promise<Course> {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal mengupdate course");
  }

  const result = await response.json();
  return result.data || result;
}

export async function deleteCourse(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menghapus course");
  }
}

// ── Lesson API Helpers ──────────────────────────────────────────────────

export async function fetchLessonById(id: number): Promise<Lesson> {
  const response = await dedupFetch(`${API_BASE_URL}/lessons/${id}/full`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal mengambil detail lesson");
  }

  const result = await response.json();
  return result.data || result;
}

export async function fetchLessonByIdBasic(id: number): Promise<Lesson> {
  const response = await dedupFetch(`${API_BASE_URL}/lessons/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal mengambil detail materi");
  }

  const result = await response.json();
  return result.data || result;
}

export async function createLesson(courseId: number, payload: CreateLessonPayload): Promise<Lesson> {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menambah materi lesson");
  }

  const result = await response.json();
  return result.data || result;
}

export async function updateLesson(id: number, payload: UpdateLessonPayload): Promise<Lesson> {
  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal memperbarui materi lesson");
  }

  const result = await response.json();
  return result.data || result;
}

export async function deleteLesson(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menghapus materi lesson");
  }
}

// ── Lesson Chunk API Helpers ────────────────────────────────────────────

export async function fetchChunkById(id: number): Promise<LessonChunk> {
  const response = await fetch(`${API_BASE_URL}/lesson-chunks/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal mengambil detail chunk");
  }

  const result = await response.json();
  return result.data || result;
}

export async function createChunk(lessonId: number, payload: CreateChunkPayload): Promise<LessonChunk> {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/chunks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal membuat kontent chunk");
  }

  const result = await response.json();
  return result.data || result;
}

export async function updateChunk(id: number, payload: UpdateChunkPayload): Promise<LessonChunk> {
  const response = await fetch(`${API_BASE_URL}/lesson-chunks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal memperbarui konten chunk");
  }

  const result = await response.json();
  return result.data || result;
}

export async function deleteChunk(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/lesson-chunks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menghapus konten chunk");
  }
}

// ── Quiz Options API Helpers ────────────────────────────────────────────

export async function createQuizOption(
  quizId: number,
  payload: { options: string; is_true?: boolean }
): Promise<ChunkQuizOption> {
  const response = await fetch(`${API_BASE_URL}/chunk-quizzes/${quizId}/options`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menambah opsi kuis");
  }

  const result = await response.json();
  return result.data || result;
}

export async function updateQuizOption(
  id: number,
  payload: { options?: string; is_true?: boolean }
): Promise<ChunkQuizOption> {
  const response = await fetch(`${API_BASE_URL}/chunk-quiz-options/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal memperbarui opsi kuis");
  }

  const result = await response.json();
  return result.data || result;
}

export async function deleteQuizOption(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chunk-quiz-options/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menghapus opsi kuis");
  }
}

export async function enrollCourse(courseId: number): Promise<any> {
  fetchCoursesPromiseMap.clear();
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal mendaftar kelas");
  }
  const result = await response.json();
  return result.data || result;
}

export async function markChunkSeen(chunkId: number): Promise<any> {
  fetchCoursesPromiseMap.clear();
  const response = await fetch(`${API_BASE_URL}/lesson-chunks/${chunkId}/seen`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menandai konten dibaca");
  }
  const result = await response.json();
  return result.data || result;
}

export async function answerQuiz(quizId: number, optionId: number): Promise<any> {
  fetchCoursesPromiseMap.clear();
  const response = await fetch(`${API_BASE_URL}/chunk-quizzes/${quizId}/answer`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ option_id: optionId }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menjawab kuis");
  }
  const result = await response.json();
  return result.data || result;
}

export async function completeLesson(lessonId: number): Promise<any> {
  fetchCoursesPromiseMap.clear();
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/complete`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Gagal menyelesaikan materi");
  }
  const result = await response.json();
  return result.data || result;
}

export async function fetchCourseHistory(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/courses/history`, {
    method: "GET",
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error("Gagal mengambil riwayat belajar");
  }
  const result = await response.json();
  return result.data || result;
}
