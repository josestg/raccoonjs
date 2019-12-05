const { Feature } = require("../Feature");
const helper = require("../helper");
const db = require("./fakedb");
const { ResponseMessage } = require("..//ResponseMessage");

class Report extends Feature {
    constructor(owner) {
        super(owner);
    }

    async start() {
        const keyboard = [];
        const data = await db.getUserReport("U1");
        let row = 0;
        for (let project of data.projects) {
            for (let task of project.tasks) {
                const { name, status } = task;
                if (status == db.DONE) continue;

                const btn = helper.makeButton(name, {
                    prefix: this.prefix,
                    action: "onTaskClicked",
                    params: helper.encodePosition(row, 0)
                });
                keyboard.push([btn]);
                row += 1;
            }
        }

        keyboard.push([
            helper.makeButton("Done", {
                prefix: this.prefix,
                action: "onTaskDone",
                params: helper.encodePosition(row + 1, 0)
            }),
            helper.makeButton("Cancel", {
                prefix: this.prefix,
                action: "onTaskCancel",
                params: helper.encodePosition(row + 1, 1)
            })
        ]);

        return new ResponseMessage("$send", {
            owner: this.owner,
            message: "Berikut adalah task Anda!",
            inline_keyboard: keyboard
        });
    }

    onTaskClicked(params, context) {
        const { row, col } = helper.decodePosition(params);
        const { message } = context;
        const { inline_keyboard: keyboard } = message.reply_markup;
        keyboard[row][col].text = helper.toogleCheckIcon(keyboard[row][col].text);

        return new ResponseMessage("$edit", {
            owner: this.owner,
            message: message.text,
            inline_keyboard: keyboard
        });
    }

    onTaskDone(params, context) {
        return new ResponseMessage("$delete", {
            owner: this.owner,
            destroy: true
        });
    }

    onTaskCancel(params, context) {
        return new ResponseMessage("$delete", {
            owner: this.owner,
            destroy: true
        });
    }
}

module.exports = {
    Report
};
