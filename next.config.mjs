// Inställningar för Next.js.

// Bilder som laddas upp på adminsidan sparas i Supabase Storage. Next.js visar
// bara bilder från andra webbadresser som står här, så vi tillåter just vår
// bildmapp – inga andra.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabase ? [new URL(`${supabase}/storage/v1/object/public/product-images/**`)] : [],
  },
};

export default nextConfig;
