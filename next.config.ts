/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PROPOSAL_TOKEN: process.env.PROPOSAL_SECRET_TOKEN,
  },
};

export default nextConfig;
