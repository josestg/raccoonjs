
const { Raccoon } = require('@joseastg/raccoon/core/Raccoon')
const { Report }  = require('./app/Report')
const { Task }  = require('./app/Task')

const R = new Raccoon(process.env.BOT_TOKEN, {polling: true})

R.onText(/\/r/, context => {
    const { from } = context
    const report = new Report(from.id)
    const token  = R.registerFeature(from.id, report)
    R.start(token, report)
    R.deleteMessage(from.id, context.message_id)
})

R.onText(/\/t/, context => {
    const { from } = context
    const task = new Task(from.id)
    const token  = R.registerFeature(from.id, task)
    R.start(token, task)
    R.deleteMessage(from.id, context.message_id)
})

R.watchFeatureCallback()