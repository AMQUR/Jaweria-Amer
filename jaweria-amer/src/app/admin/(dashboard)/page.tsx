import { BookOpen, FileQuestion, FolderOpen, ImageUp, Users, TrendingUp } from "lucide-react";
import { getCourses, getLeads, getSettings } from "@/lib/admin/store";
import { getCmsMcqSets, getCmsResources, getHomepageContent } from "@/lib/admin/cms-store";
import Link from "next/link";

export default async function AdminDashboard() {
  const [courses, resources, mcqs, leads, settings, homepageContent] = await Promise.all([
    getCourses(),
    getCmsResources(),
    getCmsMcqSets(),
    getLeads(),
    getSettings(),
    getHomepageContent(),
  ]);

  const newLeads = leads.filter((l) => l.status === "new").length;
  const activeCourses = courses.filter((c) => c.status === "active").length;

  const stats = [
    { label: "Total Courses", value: courses.length, icon: BookOpen, href: "/admin/courses", color: "bg-brand-soft text-brand" },
    { label: "Active Courses", value: activeCourses, icon: TrendingUp, href: "/admin/courses", color: "bg-muted text-ink" },
    { label: "Resources", value: resources.length, icon: FolderOpen, href: "/admin/resources", color: "bg-brand-soft/70 text-brand" },
    { label: "New Leads", value: newLeads, icon: Users, href: "/admin/leads", color: "bg-brand-soft text-brand-accent" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="text-sm text-slate mt-1">Welcome back, Jaweria. Here&apos;s your overview.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-border/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl font-semibold tracking-tight text-ink">{stat.value}</p>
            <p className="text-xs text-slate mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-ink">Quick Settings</h2>
            <Link href="/admin/settings" className="text-xs text-brand transition-colors hover:text-brand-accent">
              Edit
            </Link>
          </div>
          <div className="space-y-3">
            <div className="py-2 border-b border-border/40">
              <p className="text-xs text-slate-light mb-0.5">WhatsApp Number</p>
              <p className="text-sm font-medium text-ink">+{settings.whatsappNumber}</p>
            </div>
            <div className="py-2 border-b border-border/40">
              <p className="text-xs text-slate-light mb-0.5">Stats Ticker</p>
              <p className="text-sm font-medium text-ink">{settings.stats.length} stat{settings.stats.length !== 1 ? "s" : ""} displayed</p>
            </div>
            <div className="py-2">
              <p className="text-xs text-slate-light mb-1.5">Active Stats</p>
              <div className="space-y-1">
                {settings.stats.slice(0, 4).map((stat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate truncate mr-2">{stat.label}</span>
                    <span className="font-medium text-ink shrink-0">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-ink">Content Controls</h2>
            <Link href="/admin/homepage" className="text-xs text-brand transition-colors hover:text-brand-accent">
              Edit
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-cream p-3">
              <div className="flex items-center gap-3">
                <ImageUp className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-sm font-medium text-ink">Homepage hero</p>
                  <p className="text-xs text-slate-light">{homepageContent.primaryCtaText} / {homepageContent.secondaryCtaText}</p>
                </div>
              </div>
              <Link href="/admin/homepage" className="text-xs text-brand">Manage</Link>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-cream p-3">
              <div className="flex items-center gap-3">
                <FileQuestion className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-sm font-medium text-ink">Quick Worksheets</p>
                  <p className="text-xs text-slate-light">{mcqs.length} MCQ sets in the library</p>
                </div>
              </div>
              <Link href="/admin/mcq" className="text-xs text-brand">Manage</Link>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-cream p-3">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-4 w-4 text-brand" />
                <div>
                  <p className="text-sm font-medium text-ink">Uploads</p>
                  <p className="text-xs text-slate-light">PDFs, banner artwork, and public assets</p>
                </div>
              </div>
              <Link href="/admin/uploads" className="text-xs text-brand">Open</Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold tracking-tight text-ink mb-4">Recent Leads</h2>
          {leads.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-slate-light/50 mx-auto mb-2" />
              <p className="text-sm text-slate-light">No inquiries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink">{lead.name}</p>
                    <p className="text-xs text-slate-light">{lead.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    lead.status === "new" ? "bg-brand-soft text-brand" :
                    lead.status === "contacted" ? "bg-amber-50 text-amber-700" :
                    "bg-green-50 text-green-700"
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold tracking-tight text-ink mb-4">Courses Overview</h2>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-slate-light/50 mx-auto mb-2" />
              <p className="text-sm text-slate-light">No courses created yet</p>
              <Link href="/admin/courses" className="mt-1 inline-block text-xs text-brand transition-colors hover:text-brand-accent">
                Create your first course
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div key={course.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink">{course.title}</p>
                    <p className="text-xs text-slate-light">{course.level}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    course.status === "active" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {course.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
