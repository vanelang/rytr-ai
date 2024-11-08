import cron from "node-cron";

export function startCronJobs() {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const response = await fetch("http://localhost:3000/api/cron/generate-content", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Cron job executed:", data);
    } catch (error) {
      console.error("Cron job failed:", error);
    }
  });
}
