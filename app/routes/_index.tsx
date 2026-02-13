import Hero from "~/components/Hero";
import type { Route } from "./+types/_index";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import OriginStories from "~/components/OriginStories";
import VideoBlock from "~/components/VideoBlock";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hall of Zero Limits" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060B12] text-white">
      <Header />

      <main className="flex flex-col min-h-[calc(100vh-80px)] justify-start ">
        <Hero />
        <OriginStories />
        <VideoBlock />
      </main>
      <Footer />
    </div>
  );
}
