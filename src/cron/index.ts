import { AsyncTask, SimpleIntervalJob, ToadScheduler } from "toad-scheduler"

const scheduler = new ToadScheduler()

const task = new AsyncTask("simple task", async () => {
    console.log("Hello world")
})

const job = new SimpleIntervalJob({ seconds: 5 }, task)

scheduler.addSimpleIntervalJob(job)
