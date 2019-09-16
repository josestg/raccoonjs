
# Raccoon : Mini-framework for Telegram Bots

Making a telegram bot using Raccoon makes it easy for developers to focus on developing features. 

One of Raccoon's goals is to be able to automatically execute the methods in each feature just by entering the name of the method to be executed in the callback data.

## Why use Raccoon

1. Easy workflow (focus on developing feature).
2. Easily set how long a session for a feature over.
3. The response format is easy to read, etc.

## Quick Start

Create project

```bash
$ mdkir app
$ touch app/Task.js
$ touch main.js
```
Install racconjs

```bash
$ npm i raccoonjs
```

Create Feature

```js
// ./app/Task.js
const { Feature } = require('raccoonjs/Raccoon')
const { makeButton } = require('raccoonjs/utils')
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
```
Create main

```js
// main.js
const { Raccoon } = require('raccoonjs/Raccoon')
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
Result

<img src="./images/response.png">

[See more example](https://github.com/josestg/raccoonjs-example)

## Similar Projects
1. [raccoonjs-example](https://github.com/josestg/raccoonjs-example)
2. [privy-standup-meeting-bot](https://github.com/mtfiqh/privy-standup-meeting-bot)






