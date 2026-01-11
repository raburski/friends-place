import { BunnyCDNClient } from "@raburski/bunny-cdn-client";
import { env } from "@/lib/env";

export const createBunnyClient = () => {
  return new BunnyCDNClient({
    storageZone: env.bunnyStorageZone(),
    apiKey: env.bunnyApiKey(),
    cdnUrl: env.bunnyCdnUrl(),
    pullZoneUrl: env.bunnyPullZoneUrl()
  });
};
