import { startCronJobs } from "@/lib/cron-service";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

if (process.env.NODE_ENV === "development") {
  startCronJobs();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
