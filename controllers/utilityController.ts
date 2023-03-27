import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";

const report = new AsyncTask(
  "report-data",
  async () => {
    const reportData = "Report generate at: " + new Date().toLocaleString();
    console.log(reportData);
  },
  (err) => console.log(err.message)
);

export const schedulerReport = new SimpleIntervalJob({ minutes: 10 }, report);
