
const { Raccoon } = require('../core/Raccoon')
const { Report }  = require('./app/Report')

const R = new Raccoon(process.env.BOT_TOKEN, {polling: true})

R.onText(/\/r/, context => {
    const { from } = context
    const report = new Report(from.id)
    const token  = R.registerFeature(from.id, report)
    R.start(token, report)
    R.deleteMessage(from.id, context.message_id)
})

R.watchFeatureCallback()