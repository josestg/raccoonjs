const { Feature } = require("../../core/Raccoon");
const utils = require("../../core/utils");
const db = require("./fakedb");

class Report extends Feature {
    constructor(id) {
        super(id);
    }

    async start() {
        const keyboard = [];
        const data = await db.getUserReport("U1");
        let row = 0;
        for (let project of data.projects) {
            for (let task of project.tasks) {
                const { name, status } = task;
                if (status == db.DONE) continue;

                const btn = utils.makeButton(name, {
                    prefix: this.prefix,
                    action: "onTaskClicked",
                    params: utils.encodePosition(row, 0)
                });
                keyboard.push([btn]);
                row += 1;
            }
        }

        keyboard.push([
            utils.makeButton("Done", {
                prefix: this.prefix,
                action: "onTaskDone",
                params: utils.encodePosition(row + 1, 0)
            }),
            utils.makeButton("Cancel", {
                prefix: this.prefix,
                action: "onTaskCancel",
                params: utils.encodePosition(row + 1, 1)
            })
        ]);

        return {
            id: this.id,
            type: "$send",
            message: "Berikut adalah task Anda!",
            options: {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }
        };
    }

    onTaskClicked(params, context) {
        const { row, col } = utils.decodePosition(params);
        const { message } = context;
        const { inline_keyboard: keyboard } = message.reply_markup;
        keyboard[row][col].text = utils.toogleCheckIcon(
            keyboard[row][col].text
        );

        return {
            id: this.id,
            type: "$edit",
            message: message.text,
            options: {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }
        };
    }

    onTaskDone(params, context) {
        return {
            id: this.id,
            type: "$delete",
            destroy: true
        };
    }

    onTaskCancel(params, context) {
        return {
            id: this.id,
            type: "$delete",
            destroy: true
        };
    }
}

module.exports = {
    Report
};
