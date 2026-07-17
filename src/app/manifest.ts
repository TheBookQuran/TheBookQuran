import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quran - Read & Listen to Holy Quran",
    short_name: "Quran",
    description: "Read, Listen, Search, and Reflect on the Holy Quran with translations and recitation sync.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2ca4ab",
  };
}
