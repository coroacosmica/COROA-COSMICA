import { supabase } from "./supabase";

export async function getSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("*");

  const settings = {
    contact: {
      email: "coroa.cosmica@gmail.com",
      whatsapp_numbers: [
        { label: "Egypt", number: "+201227644162" },
        { label: "Egypt", "number": "+201000223632" },
        { label: "Portugal", number: "+351937438070" },
      ],
    },
    social: {
      facebook: "https://www.facebook.com/profile.php?id=61590414132209",
      instagram: "https://www.instagram.com/coroacosmica/",
      youtube: "https://youtube.com/@coroa_cosmica?si=1iQmUKQyXFEvKhe1",
      tiktok: "https://www.tiktok.com/@coroa_cosmica?lang=en",
    },
    hero_slides: [] as any[],
  };

  if (error || !data) {
    return settings;
  }

  data.forEach((row) => {
    if (row.key === "contact") settings.contact = row.value;
    if (row.key === "social") settings.social = row.value;
    if (row.key === "hero_slides") settings.hero_slides = row.value;
  });

  return settings;
}
