// ─────────────────────────────────────────────────────────────
//  mockData.js  —  Single source of truth
//  1000+ Job Descriptions + 1000+ Candidates
// ─────────────────────────────────────────────────────────────

export const STATUS = {
  NEW: "New", SCREENING: "Screening", INTERVIEW: "Interview",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected",
};

export const DEPARTMENTS = [
  "Engineering", "Design", "Product", "Marketing", "Sales",
  "Finance", "HR", "Operations", "Data Science", "DevOps",
];

export const SKILLS_POOL = [
  "React","Vue","Angular","TypeScript","JavaScript","Node.js","Python","Django",
  "FastAPI","Java","Spring Boot","Go","Rust","C++","PHP","Laravel","Ruby","Rails",
  "AWS","GCP","Azure","Docker","Kubernetes","Terraform","Linux","Bash","CI/CD","Git",
  "PostgreSQL","MongoDB","Redis","MySQL","GraphQL","REST API","Kafka","RabbitMQ",
  "Figma","Adobe XD","Sketch","UI/UX","Prototyping","Wireframing","User Research",
  "Machine Learning","Deep Learning","TensorFlow","PyTorch","Pandas","NumPy","Scikit-learn",
  "Data Analysis","SQL","Power BI","Tableau","Excel","Looker","dbt","Spark","Hadoop",
  "Agile","Scrum","JIRA","Confluence","Roadmapping","OKRs","Stakeholder Management",
  "SEO","Google Ads","Meta Ads","Content Marketing","Copywriting","Email Marketing","HubSpot",
  "Salesforce","B2B Sales","Lead Generation","CRM","Cold Calling","Account Management",
  "Recruitment","HRMS","Payroll","Employee Relations","Compliance","Training & Development",
  "Communication","Leadership","Problem Solving","Teamwork","Mentoring","Negotiation",
];

export const LOCATIONS = [
  "Mumbai","Bangalore","Pune","Delhi","Hyderabad","Chennai",
  "Kolkata","Ahmedabad","Noida","Gurugram","Remote",
  "Hybrid - Bangalore","Hybrid - Pune","Hybrid - Mumbai",
];

export const EXPERIENCE_LEVELS = ["Fresher","Junior","Mid-level","Senior","Lead","Principal"];

// ── HELPERS ──────────────────────────────────────────────────
const pick  = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(1));
const dateAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};

const FIRST_NAMES = [
  "Aarav","Aditi","Aditya","Akash","Akshay","Amit","Amita","Amruta","Ananya","Anil",
  "Anjali","Ankit","Ankita","Anuj","Anurag","Aparna","Arjun","Aryan","Ashish","Ashwini",
  "Ayaan","Ayesha","Bhavna","Chetan","Deepa","Deepak","Devika","Dhruv","Diksha","Divya",
  "Farhan","Gaurav","Gauri","Harsh","Harshita","Ishaan","Isha","Jatin","Jaya","Jayesh",
  "Kabir","Kajal","Karan","Kavita","Kedar","Kirti","Krishna","Kunal","Lalit","Lalita",
  "Madhav","Madhuri","Mahesh","Manish","Manisha","Mayank","Meera","Mihir","Mira","Mohit",
  "Mukesh","Namrata","Nandini","Neha","Nikhil","Nikita","Nilesh","Nisha","Nitin","Om",
  "Pallavi","Paresh","Piyush","Pooja","Prachi","Pranav","Prashant","Pratik","Priya","Priyanka",
  "Rahul","Rajesh","Rakesh","Ramesh","Ravi","Reema","Rekha","Riddhi","Rohit","Rohan",
  "Sachin","Sahil","Saket","Sameer","Sandeep","Sanjay","Sanjana","Sara","Sarika","Seema",
  "Shilpa","Shruti","Shubham","Siddhant","Siddharth","Simran","Sneha","Soham","Sonali","Sourav",
  "Sunil","Sunita","Suresh","Swati","Tanvi","Tejas","Tushar","Uday","Vaibhav","Vandana",
  "Varsha","Vijay","Vikram","Vikas","Vinay","Vishal","Vivek","Yash","Yogesh","Zara",
];

const LAST_NAMES = [
  "Agarwal","Bhat","Bhatt","Chaudhari","Chopra","Desai","Deshpande","Dubey","Garg","Ghosh",
  "Gupta","Iyer","Jain","Joshi","Kapoor","Kaur","Khan","Kulkarni","Kumar","Lal",
  "Malhotra","Mehta","Mishra","Modi","Mukherjee","Nair","Naik","Pandey","Patel","Patil",
  "Pillai","Rao","Reddy","Roy","Saxena","Shah","Sharma","Shinde","Singh","Sinha",
  "Soni","Thakur","Tiwari","Trivedi","Varma","Verma","Yadav","Bose","Das","Banerjee",
];

const COMPANIES = [
  "TCS","Infosys","Wipro","HCL","Tech Mahindra","Cognizant","Accenture","IBM","Capgemini",
  "Oracle","Microsoft","Google","Amazon","Flipkart","Zomato","Swiggy","Paytm","Razorpay",
  "CRED","PhonePe","Meesho","ShareChat","Ola","Uber","Byju's","Unacademy","Freshworks",
  "Zoho","Salesforce India","Adobe India","SAP India","Deloitte","EY","PwC","KPMG",
  "InnovateTech","NextGen Solutions","Digital Ventures","CloudFirst","DataMinds",
];

const COLLEGES = [
  "IIT Bombay","IIT Delhi","IIT Madras","IIT Kanpur","IIT Kharagpur",
  "NIT Trichy","NIT Surathkal","BITS Pilani","VIT Vellore","SRM University",
  "Pune University","Mumbai University","Delhi University","Bangalore University",
  "IIIT Hyderabad","IIIT Bangalore","Symbiosis Pune","Manipal University",
  "Amity University","Christ University",
];

// ── JD TEMPLATES (used to generate 1000+ JDs) ───────────────
const JD_TEMPLATES = [
  { title: "Frontend Developer",        dept: "Engineering",  skills: ["React","TypeScript","CSS","Redux","Jest","Webpack"] },
  { title: "Backend Engineer",          dept: "Engineering",  skills: ["Node.js","Python","PostgreSQL","REST API","Docker","AWS"] },
  { title: "Full Stack Developer",      dept: "Engineering",  skills: ["React","Node.js","MongoDB","TypeScript","Docker","Git"] },
  { title: "DevOps Engineer",           dept: "DevOps",       skills: ["AWS","Kubernetes","Docker","Terraform","CI/CD","Linux"] },
  { title: "Data Scientist",            dept: "Data Science", skills: ["Python","Machine Learning","Pandas","TensorFlow","SQL"] },
  { title: "UI/UX Designer",            dept: "Design",       skills: ["Figma","Adobe XD","Prototyping","Wireframing","UI/UX"] },
  { title: "Product Manager",           dept: "Product",      skills: ["Agile","JIRA","Roadmapping","OKRs","SQL","Analytics"] },
  { title: "ML Engineer",               dept: "Data Science", skills: ["Python","PyTorch","Deep Learning","MLOps","AWS","Docker"] },
  { title: "Android Developer",         dept: "Engineering",  skills: ["Kotlin","Android","Jetpack Compose","Firebase","REST API"] },
  { title: "iOS Developer",             dept: "Engineering",  skills: ["Swift","SwiftUI","Xcode","Core Data","Firebase"] },
  { title: "QA Engineer",               dept: "Engineering",  skills: ["Selenium","Cypress","Jest","API Testing","JIRA","Agile"] },
  { title: "Business Analyst",          dept: "Product",      skills: ["SQL","Excel","Power BI","Agile","Requirement Gathering"] },
  { title: "Digital Marketing Manager", dept: "Marketing",    skills: ["SEO","Google Ads","Meta Ads","Analytics","CRM"] },
  { title: "Sales Executive",           dept: "Sales",        skills: ["B2B Sales","CRM","Lead Generation","Salesforce","HubSpot"] },
  { title: "HR Manager",                dept: "HR",           skills: ["Recruitment","HRMS","Employee Relations","Compliance"] },
  { title: "Cloud Architect",           dept: "DevOps",       skills: ["AWS","GCP","Azure","Terraform","Kubernetes","Docker"] },
  { title: "Data Engineer",             dept: "Data Science", skills: ["Spark","Kafka","Python","SQL","dbt","Airflow","AWS"] },
  { title: "Scrum Master",              dept: "Product",      skills: ["Agile","Scrum","JIRA","Confluence","Coaching","OKRs"] },
  { title: "Go Engineer",               dept: "Engineering",  skills: ["Go","Kubernetes","Docker","gRPC","PostgreSQL","Redis"] },
  { title: "React Native Developer",    dept: "Engineering",  skills: ["React Native","JavaScript","Redux","Firebase","REST API"] },
];

const PREFIXES = ["Senior","Junior","Lead","Principal","Staff","Associate","Mid-level",""];
const SUFFIXES = ["- Remote","- Bangalore","- Pune","- Mumbai","- Hybrid",""];

// ── GENERATE 1000+ JOB DESCRIPTIONS ─────────────────────────
export const JOB_DESCRIPTIONS = Array.from({ length: 1050 }, (_, i) => {
  const tpl     = JD_TEMPLATES[i % JD_TEMPLATES.length];
  const prefix  = PREFIXES[i % PREFIXES.length];
  const suffix  = SUFFIXES[Math.floor(i / PREFIXES.length) % SUFFIXES.length];
  const title   = [prefix, tpl.title, suffix].filter(Boolean).join(" ");
  const expMin  = rand(1, 5);
  const expMax  = expMin + rand(2, 5);
  const postedDaysAgo = rand(1, 180);

  return {
    id:          `JD${String(i + 1).padStart(4, "0")}`,
    title,
    department:  tpl.dept,
    location:    pick(LOCATIONS),
    type:        pick(["Full-time","Full-time","Full-time","Contract","Part-time"]),
    experience:  `${expMin}-${expMax} years`,
    experienceMin: expMin,
    experienceMax: expMax,
    salaryMin:   rand(6, 20) * 100000,
    salaryMax:   rand(20, 60) * 100000,
    openings:    rand(1, 8),
    applicants:  rand(10, 200),
    hired:       rand(0, 3),
    status:      pick(["Active","Active","Active","Paused","Closed"]),
    priority:    pick(["High","High","Medium","Medium","Low"]),
    skills:      tpl.skills,
    postedDate:  dateAgo(postedDaysAgo),
    deadline:    dateAgo(postedDaysAgo - rand(30, 90)),
    description: `We are looking for a talented ${title} to join our ${tpl.dept} team. You will work on challenging projects, collaborate with cross-functional teams, and deliver high-quality solutions at scale.`,
    requirements: [
      `${expMin}+ years of relevant experience`,
      `Strong proficiency in ${tpl.skills.slice(0, 3).join(", ")}`,
      `Hands-on experience with ${tpl.skills.slice(3).join(", ")}`,
      "Excellent problem-solving and communication skills",
      "Experience working in an Agile environment",
    ],
    recruiter:   `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    recruiterId: `REC${rand(1, 20).toString().padStart(3, "0")}`,
  };
});

// ── GENERATE 1000+ CANDIDATES ────────────────────────────────
const generateCandidate = (index) => {
  const firstName   = pick(FIRST_NAMES);
  const lastName    = pick(LAST_NAMES);
  const expLevel    = pick(EXPERIENCE_LEVELS);
  const expYears    = expLevel === "Fresher" ? 0 : expLevel === "Junior" ? rand(1,2) : expLevel === "Mid-level" ? rand(3,5) : expLevel === "Senior" ? rand(6,9) : expLevel === "Lead" ? rand(10,13) : rand(14,20);
  const jd          = JOB_DESCRIPTIONS[index % JOB_DESCRIPTIONS.length];
  const appliedDaysAgo = rand(1, 90);

  return {
    id:             `CAND${String(index + 1).padStart(4, "0")}`,
    firstName,
    lastName,
    fullName:       `${firstName} ${lastName}`,
    email:          `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rand(1,99)}@${pick(["gmail.com","yahoo.com","outlook.com","hotmail.com"])}`,
    phone:          `+91 ${rand(6,9)}${Array.from({length:9},()=>rand(0,9)).join("")}`,
    location:       pick(LOCATIONS),
    currentCompany: pick(COMPANIES),
    currentRole:    `${pick(["Software","Senior","Lead","Associate","Junior"])} ${pick(["Developer","Engineer","Analyst","Designer","Manager"])}`,
    experienceLevel: expLevel,
    totalExperience: expYears,
    education: {
      degree:  pick(["B.Tech","M.Tech","BCA","MCA","B.Sc","MBA","B.E","M.Sc"]),
      field:   pick(["Computer Science","Information Technology","Electronics","Mechanical","MBA","Data Science"]),
      college: pick(COLLEGES),
      year:    rand(2010, 2024),
      cgpa:    randFloat(6.0, 9.9),
    },
    skills:          pickN(SKILLS_POOL, rand(4, 10)),
    appliedFor:      jd.id,
    appliedForTitle: jd.title,
    department:      jd.department,
    status:          pick([
      STATUS.NEW, STATUS.NEW, STATUS.NEW,
      STATUS.SCREENING, STATUS.SCREENING,
      STATUS.INTERVIEW,
      STATUS.OFFER,
      STATUS.HIRED,
      STATUS.REJECTED, STATUS.REJECTED,
    ]),
    rating:          randFloat(1, 5),
    matchScore:      rand(40, 99),
    noticePeriod:    pick(["Immediate","15 days","30 days","60 days","90 days"]),
    expectedCTC:     rand(4, 50) * 100000,
    currentCTC:      expYears === 0 ? 0 : rand(3, 45) * 100000,
    appliedDate:     dateAgo(appliedDaysAgo),
    lastActivity:    dateAgo(rand(0, appliedDaysAgo)),
    source:          pick(["LinkedIn","Naukri","Indeed","Referral","Company Website","Campus","Internshala","Monster"]),
    resumeUrl:       `https://example.com/resumes/CAND${String(index+1).padStart(4,"0")}.pdf`,
    notes:           rand(0,1) ? pick(["Strong candidate.","Good communication.","Technical round pending.","HR scheduled.","Offer letter pending.","Background check in progress.","References pending.","Salary negotiation ongoing."]) : "",
    tags:            pickN(["Top Talent","Referred","Urgent","On Hold","Re-applicant","Campus Hire"], rand(0, 2)),
    interviews:      Array.from({length: rand(0, 3)}, (_, i) => ({
      round:       i + 1,
      type:        pick(["Phone Screen","Technical","System Design","HR","Managerial","Culture Fit"]),
      date:        dateAgo(appliedDaysAgo - (i + 1) * rand(3, 7)),
      interviewer: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      result:      i < 2 ? pick(["Passed","Passed","Failed"]) : "Pending",
      feedback:    pick(["Good problem solving.","Needs improvement in system design.","Excellent communication.","Strong technical skills.",""]),
    })),
    summary: `Experienced ${expLevel} professional with ${expYears} years in ${jd.department}. Skilled in ${pickN(SKILLS_POOL, 3).join(", ")}. Currently at ${pick(COMPANIES)}, looking for growth opportunities.`,
  };
};

export const CANDIDATES = Array.from({ length: 1000 }, (_, i) => generateCandidate(i));

// ── DASHBOARD STATS ──────────────────────────────────────────
export const getDashboardStats = () => {
  const total = CANDIDATES.length;
  const byStatus = Object.values(STATUS).reduce((acc, s) => {
    acc[s] = CANDIDATES.filter((c) => c.status === s).length;
    return acc;
  }, {});
  const byDept = DEPARTMENTS.reduce((acc, d) => {
    acc[d] = CANDIDATES.filter((c) => c.department === d).length;
    return acc;
  }, {});
  const bySource = ["LinkedIn","Naukri","Indeed","Referral","Company Website","Campus","Internshala","Monster"].reduce((acc, s) => {
    acc[s] = CANDIDATES.filter((c) => c.source === s).length;
    return acc;
  }, {});
  const activeJDs     = JOB_DESCRIPTIONS.filter((j) => j.status === "Active").length;
  const totalOpenings = JOB_DESCRIPTIONS.reduce((s, j) => s + j.openings, 0);
  const totalHired    = JOB_DESCRIPTIONS.reduce((s, j) => s + j.hired, 0);
  const monthly       = Array.from({length: 6}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString("default", { month: "short" }),
      count: CANDIDATES.filter((c) => {
        const cd = new Date(c.appliedDate);
        return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length,
    };
  });

  return {
    totalCandidates: total, activeJDs, totalOpenings, totalHired,
    conversionRate: ((byStatus[STATUS.HIRED] / total) * 100).toFixed(1),
    avgMatchScore:  (CANDIDATES.reduce((s, c) => s + c.matchScore, 0) / total).toFixed(1),
    byStatus, byDept, bySource, monthly,
    topJDs: [...JOB_DESCRIPTIONS].sort((a, b) => b.applicants - a.applicants).slice(0, 4),
  };
};

export default { JOB_DESCRIPTIONS, CANDIDATES, getDashboardStats, STATUS, DEPARTMENTS };