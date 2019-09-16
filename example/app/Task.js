const { Feature } = require('../../core/Raccoon')
const { makeButton } = require('../../core/utils')
class Task extends Feature{
    constructor(id){
        super(id)
    }

    start(){
        return {
            id: this.id,
            type : "$send",
            message : "Hello, World!",
            options : {
                parse_mode: "Markdown",
                reply_markup:{
                    inline_keyboard : [
                        [
                            makeButton("Left",{
                                prefix : this.prefix,
                                action: "onLeftClicked",
                                params: "params on left"
                            }),
                            makeButton("Right",{
                                prefix : this.prefix,
                                action: "onRightClicked",
                                params: "params on Right"
                            })
                        ]
                    ]
                }
            }
        }
    }

    onLeftClicked(params, context){
        console.log(params)
    }

    onRightClicked(params, context){
        console.log(params)
    }

}

module.exports = {
    Task
}
