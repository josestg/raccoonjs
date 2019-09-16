
# Raccoon : Mini-framework for Creating Telegram Bots

Making a telegram bot using Raccoon makes it easy for developers to focus on developing features. 

One of Raccoon's goals is to be able to automatically execute the methods in each feature just by entering the name of the method to be executed in the callback data.

## Example
```js
// Task.js
const { Feature } = require('../../core/Raccoon')
const { makeButton } = require('../../core/utils')
class Task extends Feature{
    constructor(id){
        super(id)
    }

    start(){
        // response
        return {
            id: this.id,
            type : "$send", // ["$edit", "$delete", "$answer"]
            message : "Hello, World!",
            options : {
                parse_mode: "Markdown",
                reply_markup:{
                    inline_keyboard : [
                        [
                            makeButton("Left",{
                                prefix : this.prefix,
                                action: "onLeftClicked",
                                params: "1"
                            }), 
                            makeButton("Right",{
                                prefix : this.prefix,
                                action: "onRightClicked",
                                params: "2"
                            })
                        ]
                    ]
                }
            }
        }
    }

    /* action when button 'Left' clicked */
    onLeftClicked(params, context){
        console.log(params) // 1
    }

    /* action when button 'Right' clicked */
    onRightClicked(params, context){
        console.log(params) // 2
    }
}
```

```js
// main.js
const { Task }  = require('./app/Task')
const R = new Raccoon(process.env.BOT_TOKEN, {polling: true})
R.onText(/\/t/, context => {
    const { from } = context
    const task = new Task(from.id)
    const token  = R.registerFeature(from.id, task)
    R.start(token, task)
    R.deleteMessage(from.id, context.message_id)
})
R.watchFeatureCallback()
```

## Result
<img src="./images/response.png">

## See more examples
```bash
$ git clone https://github.com/josestg/raccoon.git
$ cd example
$ nodemon main.js
```
commands : **/t** or **/r**


## Why use Raccoon

1. Easy workflow (focus on developing feature).
2. Easily set how long a session for a feature over.
3. The response format is easy to read, etc.



