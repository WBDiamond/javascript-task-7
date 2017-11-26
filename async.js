'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        if (!jobs.length) {
            resolve([]);
        }
        let resultArray = [];
        let doneJobs = 0;

        let wrappedJobs = jobs.map(job => () => new Promise(resolveJob => {
            job().then(resolveJob, resolveJob);
            setTimeout(resolveJob, timeout, new Error('Promise timeout'));
        }));

        wrappedJobs.slice(0, parallelNum)
            .forEach((job, i) => job().then(handler.bind(null, i)));

        function handler(index, jobResult) {
            resultArray[index] = jobResult;
            if (jobs.length > ++doneJobs) {
                wrappedJobs[doneJobs + parallelNum - 1]()
                    .then(handler.bind(null, doneJobs + parallelNum - 1));
            } else {
                resolve(resultArray);
            }
        }
    });
}
