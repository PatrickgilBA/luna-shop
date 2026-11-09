// Next.js settings.

// Images uploaded on the admin page are stored in Supabase Storage. Next.js only
// shows images from outside addresses listed here, so we allow exactly our
// bucket – nothing else.
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabase ? [new URL(`${supabase}/storage/v1/object/public/product-images/**`)] : [],
  },
};

export default nextConfig;
