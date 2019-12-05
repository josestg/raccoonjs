const { Raccoon } = require("../Raccoon");
const { Report } = require("./Report");

const R = new Raccoon(process.env.BOT_TOKEN, process.env.BASE_URL);
R.startServer(
    {
        port: 5000,
        cert: "./ssl/cert.pem",
        key: "./ssl/key.pem"
    },
    () => console.log("started")
);

R.onText("/r", context => {
    const { from } = context;
    const report = new Report(from.id);
    const token = R.registerFeature(from.id, report);
    R.start(token, report);
    R.deleteMessage(from.id, context.message_id);
});

R.watchFeatureCallback();
