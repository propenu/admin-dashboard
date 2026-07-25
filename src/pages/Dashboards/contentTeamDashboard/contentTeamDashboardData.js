import {
  DATE_PRESETS as SHARED_DATE_PRESETS,
  inDateRange,
  rangeFromPreset,
} from "../shared/dashboardDateRange";

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pct = (part, whole) => {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
};

const startOfTodayMs = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const daysAgoMs = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.getTime();
};

/** Shared presets + All time (Content Team historically supported it). */
export const DATE_PRESETS = [
  ...SHARED_DATE_PRESETS.filter((item) => item.key !== "custom"),
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
];

export { rangeFromPreset, inDateRange };

const unpackBlogs = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.blogs)) return payload.blogs;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.blogs)) return payload.data.blogs;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const engagementScore = (blog) =>
  asNumber(blog.views) + asNumber(blog.likes) * 3 + asNumber(blog.shares) * 5;

const overviewBucket = (overview = {}) => {
  const active = asNumber(overview.activeProjects ?? overview.activeProperties ?? overview.active);
  const pending = asNumber(overview.pendingProjects ?? overview.pendingProperties ?? overview.pending);
  const draft = asNumber(
    overview.draftProjects ?? overview.draftProperties ?? overview.inactive ?? overview.draft,
  );
  const total =
    asNumber(overview.totalProjects ?? overview.totalProperties ?? overview.total) ||
    active + pending + draft;
  return { total, active, pending, draft };
};

const buildAlerts = ({
  drafts,
  published,
  publishedZeroViews,
  staleDrafts,
  totalViews,
  publishRate,
  topBlog,
}) => {
  const alerts = [];

  if (drafts > 5) {
    alerts.push({
      id: "draft-backlog",
      severity: "high",
      title: "Draft backlog growing",
      impact: `${drafts} drafts waiting to publish.`,
      action: "Prioritize review and publish the oldest drafts first.",
    });
  }

  if (staleDrafts.length) {
    alerts.push({
      id: "stale-drafts",
      severity: "medium",
      title: "Stale drafts need attention",
      impact: `${staleDrafts.length} drafts untouched for 14+ days.`,
      action: `Start with “${staleDrafts[0].title}”.`,
    });
  }

  if (publishedZeroViews.length) {
    alerts.push({
      id: "zero-views",
      severity: "medium",
      title: "Published posts with no traction",
      impact: `${publishedZeroViews.length} live posts have 0 views.`,
      action: "Promote via email / WhatsApp or refresh titles and SEO.",
    });
  }

  if (published > 0 && publishRate != null && publishRate < 40) {
    alerts.push({
      id: "low-publish-rate",
      severity: "medium",
      title: "Low publish rate",
      impact: `Only ${publishRate}% of content is live.`,
      action: "Clear editorial blockers and set a weekly publish cadence.",
    });
  }

  if (published > 0 && totalViews === 0) {
    alerts.push({
      id: "no-views",
      severity: "high",
      title: "No content views recorded",
      impact: "Published inventory is not generating readership.",
      action: "Check distribution channels and featured placement.",
    });
  }

  if (topBlog && engagementScore(topBlog) > 0) {
    alerts.push({
      id: "scale-winner",
      severity: "opportunity",
      title: `Top performer: ${topBlog.title}`,
      impact: `${asNumber(topBlog.views)} views · ${asNumber(topBlog.likes)} likes · ${asNumber(topBlog.shares)} shares`,
      action: "Create a follow-up piece or feature it on high-traffic pages.",
    });
  }

  if (!published && !drafts) {
    alerts.push({
      id: "empty-library",
      severity: "high",
      title: "Content library is empty",
      impact: "No blogs to support property SEO and demand education.",
      action: "Create the first locality / project explainer post.",
    });
  }

  return alerts.slice(0, 6);
};

export function mapContentTeamData({
  blogsPayload,
  projectsAnalytics = {},
  propertiesAnalytics = {},
  currentUser = null,
  range = {},
}) {
  const allBlogs = unpackBlogs(blogsPayload);
  const scope = allBlogs.filter((blog) =>
    inDateRange(blog.createdAt || blog.publishedAt, range),
  );

  const published = scope.filter((b) => b.published);
  const drafts = scope.filter((b) => !b.published);
  const featured = scope.filter((b) => b.featured);
  const createdToday = allBlogs.filter((b) => {
    const t = safeDate(b.createdAt)?.getTime();
    return t && t >= startOfTodayMs();
  });
  const publishedToday = allBlogs.filter((b) => {
    const t = safeDate(b.publishedAt)?.getTime();
    return t && t >= startOfTodayMs();
  });

  const totalViews = scope.reduce((sum, b) => sum + asNumber(b.views), 0);
  const totalLikes = scope.reduce((sum, b) => sum + asNumber(b.likes), 0);
  const totalShares = scope.reduce((sum, b) => sum + asNumber(b.shares), 0);
  const publishRate = pct(published.length, scope.length);
  const avgViews = published.length ? Math.round(totalViews / published.length) : null;
  const engRate = pct(totalLikes + totalShares, totalViews);

  const categoryMap = {};
  scope.forEach((blog) => {
    const key = String(blog.category || "uncategorized").toLowerCase();
    if (!categoryMap[key]) {
      categoryMap[key] = { key, label: titleCase(key), posts: 0, views: 0, likes: 0 };
    }
    categoryMap[key].posts += 1;
    categoryMap[key].views += asNumber(blog.views);
    categoryMap[key].likes += asNumber(blog.likes);
  });
  const categoryRows = Object.values(categoryMap).sort((a, b) => b.views - a.views || b.posts - a.posts);

  const topPosts = [...published]
    .sort((a, b) => engagementScore(b) - engagementScore(a))
    .slice(0, 8)
    .map((blog) => ({
      id: blog._id || blog.id,
      title: blog.title || "Untitled",
      category: titleCase(blog.category || "General"),
      views: asNumber(blog.views),
      likes: asNumber(blog.likes),
      shares: asNumber(blog.shares),
      featured: Boolean(blog.featured),
      publishedAt: blog.publishedAt,
      score: engagementScore(blog),
    }));

  const queueRows = [...allBlogs]
    .sort((a, b) => {
      const aDraft = a.published ? 1 : 0;
      const bDraft = b.published ? 1 : 0;
      if (aDraft !== bDraft) return aDraft - bDraft;
      return (safeDate(b.updatedAt)?.getTime() || 0) - (safeDate(a.updatedAt)?.getTime() || 0);
    })
    .slice(0, 10)
    .map((blog) => ({
      id: blog._id || blog.id,
      title: blog.title || "Untitled",
      category: titleCase(blog.category || "General"),
      status: blog.published ? (blog.featured ? "featured" : "published") : "draft",
      views: asNumber(blog.views),
      likes: asNumber(blog.likes),
      shares: asNumber(blog.shares),
      updatedAt: blog.updatedAt || blog.createdAt,
      author: blog.author?.name || blog.createdBy?.name || "—",
    }));

  const staleDrafts = drafts
    .filter((blog) => {
      const t = safeDate(blog.updatedAt || blog.createdAt)?.getTime();
      return t && t < daysAgoMs(14);
    })
    .sort(
      (a, b) =>
        (safeDate(a.updatedAt)?.getTime() || 0) - (safeDate(b.updatedAt)?.getTime() || 0),
    );

  const publishedZeroViews = published.filter((b) => asNumber(b.views) === 0);

  const pipeline = [
    { key: "ideas", label: "In library", volume: scope.length },
    { key: "draft", label: "Drafts", volume: drafts.length },
    { key: "published", label: "Published", volume: published.length },
    { key: "featured", label: "Featured", volume: featured.length },
    {
      key: "engaged",
      label: "Engaged (10+ views)",
      volume: published.filter((b) => asNumber(b.views) >= 10).length,
    },
  ].map((stage, index, list) => {
    const prev = index === 0 ? stage.volume : list[index - 1].volume;
    return {
      ...stage,
      conversionFromPrev: index === 0 ? 100 : pct(stage.volume, prev),
      dropOff: index === 0 ? 0 : Math.max(0, prev - stage.volume),
    };
  });

  const projectCounts = overviewBucket(projectsAnalytics.overview || projectsAnalytics);
  const propertyCounts = overviewBucket(propertiesAnalytics.overview || propertiesAnalytics);

  const topBlog = topPosts[0]
    ? published.find((b) => String(b._id || b.id) === String(topPosts[0].id))
    : null;

  const alerts = buildAlerts({
    drafts: drafts.length,
    published: published.length,
    publishedZeroViews,
    staleDrafts,
    totalViews,
    publishRate,
    topBlog,
  });

  const kpis = [
    {
      key: "total",
      label: "Total posts",
      value: scope.length,
      hint: "Posts in selected window",
      tone: "emerald",
    },
    {
      key: "published",
      label: "Published",
      value: published.length,
      hint: "Live on the portal",
      tone: "blue",
    },
    {
      key: "drafts",
      label: "Drafts",
      value: drafts.length,
      hint: "Awaiting publish",
      tone: "amber",
    },
    {
      key: "featured",
      label: "Featured",
      value: featured.length,
      hint: "Pinned / highlighted",
      tone: "violet",
    },
    {
      key: "views",
      label: "Total views",
      value: totalViews,
      hint: "Readership in scope",
      tone: "emerald",
    },
    {
      key: "likes",
      label: "Likes",
      value: totalLikes,
      hint: "Reader likes",
      tone: "rose",
    },
    {
      key: "shares",
      label: "Shares",
      value: totalShares,
      hint: "Social / share actions",
      tone: "blue",
    },
    {
      key: "publishRate",
      label: "Publish rate",
      value: publishRate == null ? "N/A" : `${publishRate}%`,
      hint: "Published ÷ total",
      tone: "violet",
    },
  ];

  return {
    currentUserName: currentUser?.name || currentUser?.fullName || "Content Lead",
    rangeLabel: range.label || "Selected period",
    refreshedAt: new Date(),
    kpis,
    summary: {
      total: scope.length,
      published: published.length,
      drafts: drafts.length,
      featured: featured.length,
      totalViews,
      totalLikes,
      totalShares,
      publishRate,
      avgViews,
      engRate,
      createdToday: createdToday.length,
      publishedToday: publishedToday.length,
      projectCounts,
      propertyCounts,
    },
    pipeline,
    categoryRows,
    topPosts,
    queueRows,
    alerts,
    staleDrafts: staleDrafts.slice(0, 5).map((b) => ({
      id: b._id || b.id,
      title: b.title || "Untitled",
      updatedAt: b.updatedAt || b.createdAt,
    })),
  };
}

export const formatRelativeClock = (value) => {
  const date = safeDate(value);
  if (!date) return "Just now";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export { titleCase, asNumber, unpackBlogs };
