const DONE = "DONE";
const IN_PROGRESS = "IN_PROGRESS";
function getUserReport(id, err = false) {
    return new Promise((resolve, reject) => {
        if (err == true)
            reject({
                error: true,
                message: "Fake Error"
            });
        setTimeout(() => {
            resolve(userProjects[id]);
        }, 1000);
    });
}

/**
 * user {
 *      id,
 *      name,
 *      projects []
 * }
 *
 * project {
 *      projectID,
 *      projectName,
 *      tasks []
 * }
 *
 * tasks {
 *      taskID
 *      taskName
 *      status []
 * }
 */

const userProjects = {
    U1: {
        id: "U1",
        name: "User 1",
        projects: [
            {
                id: "P1",
                name: "Project 1",
                tasks: [
                    {
                        id: "T1",
                        name: "Task 1 P1U1",
                        status: IN_PROGRESS
                    },
                    {
                        id: "T2",
                        name: "Task 2 P1U1",
                        status: DONE
                    },
                    {
                        id: "T3",
                        name: "Task 3 P1U1",
                        status: IN_PROGRESS
                    }
                ]
            },
            {
                id: "P2",
                name: "Project 2",
                tasks: [
                    {
                        id: "T1",
                        name: "Task 1 P2U1",
                        status: IN_PROGRESS
                    },
                    {
                        id: "T2",
                        name: "Task 2 P2U1",
                        status: IN_PROGRESS
                    },
                    {
                        id: "T3",
                        name: "Task 3 P2U1",
                        status: IN_PROGRESS
                    }
                ]
            }
        ]
    },
    U2: {
        id: "U2",
        name: "User 2",
        projects: [
            {
                id: "P1",
                name: "Project 1",
                tasks: [
                    {
                        id: "T4",
                        name: "Task 4 P1U2",
                        status: IN_PROGRESS
                    },
                    {
                        id: "T5",
                        name: "Task 5 P1U2",
                        status: IN_PROGRESS
                    }
                ]
            },
            {
                id: "P2",
                name: "Project 2",
                tasks: [
                    {
                        id: "T4",
                        name: "Task 4 P2U2",
                        status: IN_PROGRESS
                    },
                    {
                        id: "T5",
                        name: "Task 5 P2U2",
                        status: IN_PROGRESS
                    }
                ]
            }
        ]
    }
};

module.exports = {
    getUserReport,
    IN_PROGRESS,
    DONE
};
