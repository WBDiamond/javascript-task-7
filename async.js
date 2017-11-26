'use strict';

exports.isStar = false;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    return new Promise((resolve) => {
        if (!jobs.length) {
            resolve([]);
        }
        let resultArray = [];
        let doneJobs = 0;

        let wrappedJobs = jobs.map(job => () => new Promise(resolveJob => {
            job().then(resolveJob);
            setTimeout(resolveJob, timeout, new Error('Promise timeout'));
        }));

        let startQueue = wrappedJobs.slice(0, parallelNum);

        startQueue.forEach((job, i) => {
            job().then(handler.bind(null, i));
        });

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
