const fs = require('fs');
const path = require('path');

const features = [
  { name: 'attendance', title: 'Attendance Logs', desc: 'Monitor daily check-in, check-out, and overall working hours.' },
  { name: 'leave', title: 'Leave Management', desc: 'Request, approve, and track annual leave and other time-offs.' },
  { name: 'payroll', title: 'Payroll System', desc: 'Process salaries, view payslips, and manage tax configurations.' },
  { name: 'overtime', title: 'Overtime Tracker', desc: 'Track and approve overtime hours for employees.' },
  { name: 'shift', title: 'Shift Scheduler', desc: 'Plan shifts, schedules, and rota lists for employee departments.' },
  { name: 'reimbursement', title: 'Reimbursement Claims', desc: 'Manage expense claims, medical checks, and approvals.' },
  { name: 'recruitment', title: 'Recruitment Hub', desc: 'Manage job vacancies, candidates, and interview processes.' },
  { name: 'onboarding', title: 'Onboarding Checklists', desc: 'Welcome new hires with structured tasks and workflows.' },
  { name: 'appraisal', title: 'Performance Appraisal', desc: 'Review key performance indicators and gather feedback.' },
  { name: 'training', title: 'Training & Courses', desc: 'Manage skill courses, enrollments, and professional development.' },
  { name: 'document', title: 'Document Center', desc: 'Store, sign, and retrieve digital employment contracts.' },
  { name: 'announcement', title: 'Company Announcements', desc: 'Publish news, updates, and company-wide notifications.' },
  { name: 'organization', title: 'Organization Structure', desc: 'Define departments, job levels, and reporting lines.' }
];

const basePath = path.join(__dirname, '../src/features');

if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

features.forEach((feat) => {
  const featDir = path.join(basePath, feat.name);
  const pagesDir = path.join(featDir, 'pages');
  
  fs.mkdirSync(pagesDir, { recursive: true });
  
  // Create page file
  const pageContent = `export function ${feat.name.charAt(0).toUpperCase() + feat.name.slice(1)}Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">${feat.title}</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xs min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-[#e0542c]/10 flex items-center justify-center text-[#e0542c] mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">${feat.title} Page</h2>
        <p className="text-sm text-gray-500 max-w-md">
          ${feat.desc}
        </p>
      </div>
    </div>
  );
}
`;

  const pagePath = path.join(pagesDir, `${feat.name}-page.tsx`);
  fs.writeFileSync(pagePath, pageContent);
  console.log(`Created ${pagePath}`);
  
  // Create index.ts
  const indexPath = path.join(featDir, 'index.ts');
  const indexContent = `export * from "./pages/${feat.name}-page";\n`;
  fs.writeFileSync(indexPath, indexContent);
  console.log(`Created ${indexPath}`);
});
