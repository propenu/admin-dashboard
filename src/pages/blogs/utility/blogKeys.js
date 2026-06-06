// blogs/utility/blogKeys.js
export const blogKeys = {
  all: ["blogs"],
  lists: () => [...blogKeys.all, "list"],
  list: (filters) => [...blogKeys.lists(), { filters }],
  details: () => [...blogKeys.all, "detail"],
  detail: (id) => [...blogKeys.details(), id],
  slug: (slug) => [...blogKeys.all, "slug", slug],
};
