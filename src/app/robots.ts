import type { MetadataRoute } from "next";

import { ambienteIndexavel, regrasDeRobots } from "../lib/indexacao";
import { obterSiteUrl } from "../lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return regrasDeRobots(obterSiteUrl(), ambienteIndexavel());
}
