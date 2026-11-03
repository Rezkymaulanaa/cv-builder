import type { CvContent, CvData, Language } from "./schema";
import { TEMPLATES, type TemplateId } from "./templates";

export function emptyContent(): CvContent {
  return {
    photo: null,
    personal: { fullName: "", headline: "", email: "", phone: "", location: "", country: "", linkedin: "", website: "" },
    summary: "",
    summaryPlacement: "section",
    experience: [],
    organizations: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    customSections: [],
  };
}

export function emptyCv(language: Language = "id", templateId: TemplateId = "modern"): CvData {
  return {
    version: 1,
    language,
    mode: "template",
    templateId,
    style: structuredClone(TEMPLATES[templateId]),
    content: emptyContent(),
  };
}

const sampleId: CvContent = {
  photo: null,
  personal: {
    fullName: "Budi Santoso",
    headline: "Product Manager",
    email: "budi.santoso@example.com",
    phone: "+62 812 0000 0000",
    location: "Jakarta",
    country: "Indonesia",
    linkedin: "linkedin.com/in/budisantoso",
    website: "budisantoso.example.com",
  },
  summaryPlacement: "section",
  summary:
    "Product Manager dengan 6 tahun pengalaman membangun produk digital di bidang e-commerce dan fintech. Terbiasa memimpin tim lintas fungsi dan mengambil keputusan berbasis data.",
  experience: [
    {
      role: "Senior Product Manager",
      company: "PT Niaga Digital",
      location: "Jakarta",
      startDate: "2022-03",
      endDate: "",
      current: true,
      description:
        "Memimpin peluncuran fitur pembayaran yang meningkatkan konversi sebesar 18%.\nMengelola peta jalan produk bersama 12 engineer dan 3 desainer.\nMenurunkan tiket dukungan pelanggan sebesar 25% melalui perbaikan alur checkout.",
    },
    {
      role: "Product Manager",
      company: "PT Solusi Finansial",
      location: "Bandung",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      description:
        "Meluncurkan aplikasi pinjaman mikro yang mencapai 200.000 pengguna dalam satu tahun.\nMenjalankan riset pengguna dan uji A/B untuk memprioritaskan fitur.",
    },
  ],
  education: [
    {
      level: "bachelor",
      degree: "Teknik Informatika",
      gpa: "3.75",
      gpaMax: "4.00",
      school: "Institut Teknologi Nusantara",
      location: "Bandung",
      startDate: "2014-08",
      endDate: "2018-07",
      current: false,
      description: "Lulus dengan predikat cum laude.",
    },
  ],
  organizations: [
    {
      organization: "HIMATIF",
      role: "Ketua",
      organizationDescription: "Himpunan Mahasiswa Teknik Informatika Institut Teknologi Nusantara",
      location: "Bandung",
      startDate: "2016-08",
      endDate: "2017-08",
      current: false,
      description: "Memimpin 40 pengurus dalam menjalankan 12 program kerja.\nMenggagas program mentoring yang diikuti 150 mahasiswa baru.",
    },
  ],
  skills: [
    { category: "Hard Skills", year: "", description: "Manajemen Produk, Analisis Data, SQL, Agile, Scrum, Uji A/B, Jira, Figma", format: "text" },
    { category: "Soft Skills", year: "", description: "Kepemimpinan, Komunikasi, Pemecahan Masalah", format: "text" },
  ],
  projects: [
    {
      name: "Dasbor Analitik Penjualan",
      url: "budisantoso.example.com/dasbor",
      description: "Membangun dasbor internal yang dipakai 40 anggota tim untuk memantau penjualan harian.",
    },
  ],
  certifications: [{ name: "Certified Scrum Product Owner", issuer: "Scrum Alliance", date: "2021-05" }],
  languages: [
    { name: "Indonesia", level: "Penutur asli" },
    { name: "Inggris", level: "Profesional" },
  ],
  customSections: [{ title: "Kegiatan Sukarela", description: "Mentor di program literasi digital untuk UMKM." }],
};

const sampleEn: CvContent = {
  photo: null,
  personal: { ...sampleId.personal },
  summaryPlacement: "section",
  summary:
    "Product Manager with 6 years of experience building digital products in e-commerce and fintech. Used to leading cross-functional teams and making data-driven decisions.",
  experience: [
    {
      ...sampleId.experience[0],
      description:
        "Led the launch of a payment feature that increased conversion by 18%.\nManaged the product roadmap with 12 engineers and 3 designers.\nReduced customer support tickets by 25% by improving the checkout flow.",
    },
    {
      ...sampleId.experience[1],
      description:
        "Launched a micro-lending app that reached 200,000 users within one year.\nRan user research and A/B tests to prioritize features.",
    },
  ],
  education: [
    {
      ...sampleId.education[0],
      degree: "Computer Science",
      description: "Graduated cum laude.",
    },
  ],
  organizations: [
    {
      ...sampleId.organizations[0],
      role: "Chair",
      organizationDescription: "Informatics Student Association, Institut Teknologi Nusantara",
      description: "Led 40 board members in running 12 programs.\nStarted a mentoring program joined by 150 new students.",
    },
  ],
  skills: [
    { category: "Hard Skills", year: "", description: "Product Management, Data Analysis, SQL, Agile, Scrum, A/B Testing, Jira, Figma", format: "text" },
    { category: "Soft Skills", year: "", description: "Leadership, Communication, Problem Solving", format: "text" },
  ],
  projects: [
    {
      name: "Sales Analytics Dashboard",
      url: "budisantoso.example.com/dashboard",
      description: "Built an internal dashboard used by 40 team members to track daily sales.",
    },
  ],
  certifications: [...sampleId.certifications],
  languages: [
    { name: "Indonesian", level: "Native" },
    { name: "English", level: "Professional" },
  ],
  customSections: [{ title: "Volunteering", description: "Mentor in a digital literacy program for small businesses." }],
};

export function sampleContent(language: Language): CvContent {
  return structuredClone(language === "id" ? sampleId : sampleEn);
}
