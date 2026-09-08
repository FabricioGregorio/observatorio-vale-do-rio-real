import type { MetadataRoute } from "next";

import { urlDoSite } from "../lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dev/",
    },
    sitemap: urlDoSite("/sitemap.xml").href,
    host: urlDoSite("/").origin,
  };
}
