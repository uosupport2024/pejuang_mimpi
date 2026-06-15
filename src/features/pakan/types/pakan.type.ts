export interface JobOpening {
  id: string;
  position: string;
  company: string;
  location: string;
  salary: string;
  category: string;
  jobType: string;    // "Full-time" | "Part-time" | "Contract" | "Internship"
  workplace: string;  // "On-site" | "Hybrid" | "Remote"
  salaryMin: number;  // in millions (e.g. 6.5)
  salaryMax: number;  // in millions (e.g. 9.0)
}

export interface JobCategory {
  id: string;
  name: string;
  iconName: string;
  colorFrom: string;
  colorTo: string;
}

export interface PakanUser {
  name: string;
  role: string;
  gender?: string;
  lembur?: number;
}

export interface PakanPageProps {
  user: PakanUser;
}
