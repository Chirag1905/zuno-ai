import GridShape from "@/components/admin/common/GridShape";
import Image from "next/image";
import Link from "next/link";
import "@/app/admin/css.css"

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 bg-[#1f183e]">
      <GridShape />
      <div className="mx-auto w-full max-w-60.5 text-center sm:max-w-118">
        <h1 className="mb-8 font-bold text-title-md text-white xl:text-title-2xl">
          ERROR
        </h1>

        <Image
          src="/images/error/404-dark.svg"
          alt="404"
          width={472}
          height={152}
        />

        <p className="mt-10 mb-6 text-base text-gray-300 sm:text-lg">
          We can’t seem to find the page you are looking for!
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800 px-5 py-3.5 text-sm font-medium text-gray-200 shadow-theme-xs hover:bg-gray-700 hover:text-white"
        >
          Back to Home Page
        </Link>
      </div>
      {/* <!-- Footer --> */}
      <p className="absolute text-sm text-center text-gray-300 -translate-x-1/2 bottom-6 left-1/2">
        &copy; {new Date().getFullYear()} - Zuno AI
      </p>
    </div>
  );
}
