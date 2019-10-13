const assert = require('assert')
const { ResponseMessage } = require("../ResponseMessage")
const { FieldIsRequiredError } = require('../Error')

const tableTestAttributes = [
    {
        input : {
            type: "$send",
            options : {
                owner: "1",
                message: "Hello"
            }
        },
        expected : {
            message: "Hello",
            destroy: false,
            parse_mode: "Markdown",
            inline_keyboard: null,
            keyboard:null
        },
        expectedBody:{
            type: "$send",
            owner: "1",
            message: "Hello",
            destroy: false,
            options: {
                parse_mode : "Markdown",
                reply_markup: {}
            }
        },
        textBody : "Simple response body (only send a message)",
        text: "Test default value of attributes."
    },{
        input : {
            type: "$edit",
            options : {
                owner: "1",
                message: "Hello",
                destroy: true,
                parse_mode: "HTML"
            }
        },
        expected : {
            destroy: true,
            parse_mode: "HTML",
            message: "Hello",
            inline_keyboard: null,
            keyboard:null
        },
        expectedBody:{
            type: "$edit",
            owner: "1",
            message: "Hello",
            destroy: true,
            options: {
                parse_mode : "HTML",
                reply_markup: {}
            }
        },
        textBody : "Simple response body (only send a message) but overide default value of parse_mode and destroy by different values.",
        text: "Test overide default value of parse_mode and destroy by different values."
    },{
        input : {
            type: "$edit",
            options : {
                owner: "1",
                message: "Hello",
                destroy: false,
                parse_mode: "Markdown"
            }
        },
        expected : {
            destroy: false,
            parse_mode: "Markdown",
            inline_keyboard: null,
            keyboard:null,
            message: "Hello"
        },
        expectedBody:{
            type: "$edit",
            owner: "1",
            message: "Hello",
            destroy: false,
            options: {
                parse_mode : "Markdown",
                reply_markup: {}
            }
        },
        textBody : "Simple response body (only send a message) but overide default value of parse_mode and destroy by the same values.",
        text: "Test overide default value of parse_mode and destroy by the same values."
    },{
        input : {
            type: "$edit",
            options : {
                owner: "1",
                message: "Hello",
                destroy: false,
                parse_mode: "Markdown",
                keyboard : []
            }
        },
        expected : {
            destroy: false,
            parse_mode: "Markdown",
            inline_keyboard: null,
            keyboard:[],
            message: "Hello"
        },
        expectedBody:{
            type: "$edit",
            owner: "1",
            message: "Hello",
            destroy: false,
            options: {
                parse_mode : "Markdown",
                reply_markup: {
                    keyboard: []
                }
            }
        },
        textBody : "Response body with keyboard.",
        text: "Test overide default value of keyboard."

    },{
        input : {
            type: "$edit",
            options : {
                owner: "1",
                message: "Hello",
                destroy: false,
                parse_mode: "Markdown",
                inline_keyboard: []
            }
        },
        expected : {
            destroy: false,
            parse_mode: "Markdown",
            inline_keyboard: [],
            keyboard:null,
            message: "Hello"
        },
        expectedBody:{
            type: "$edit",
            owner: "1",
            message: "Hello",
            destroy: false,
            options: {
                parse_mode : "Markdown",
                reply_markup: {
                    inline_keyboard: []
                }
            }
        },
        textBody : "Response body with inline_keyboard.",
        text: "Test overide default value of inline_keyboard."
    },{
        input : {
            type: "$edit",
            options : {
                owner: "1",
                message: "Hello",
                inline_keyboard: [],
                keyboard: []
            }
        },
        expected : {
            destroy: false,
            parse_mode: "Markdown",
            inline_keyboard: [],
            keyboard:[],
            message: "Hello"
        },
        expectedBody:{
            type: "$edit",
            owner: "1",
            message: "Hello",
            destroy: false,
            options: {
                parse_mode : "Markdown",
                reply_markup: {
                    inline_keyboard: [],
                    keyboard : []
                }
            }
        },
        textBody : "Response body with both keyboard and inline_keyboard.",
        text: "Test overide default value of both inline_keyboard and keyboard."
    }

]

describe("Test#ResponseMessage.js", () => {
    describe("contructor: Test attributes", () => {
        for(let tcase of tableTestAttributes){
            const {input, expected} = tcase
            const RM = new ResponseMessage(input.type, input.options)
            it(tcase.text, () => {
                assert.equal(RM.parseMode, expected.parse_mode)
                assert.equal(RM.destroy, expected.destroy)
                assert.deepEqual(RM.keyboard, expected.keyboard)
                assert.equal(RM.message, expected.message)
                assert.deepEqual(RM.inlineKeyboard, expected.inline_keyboard)
            })
            
        }

        it("Test type $batch then type options must be Array", () => {
            const fn = () => new ResponseMessage("$batch", {})
            assert.throws(fn, TypeError)
        })

        it("Test type $batch then all items in options must be instance of ResponseMessage (Error)", () => {
            const fn = () => new ResponseMessage("$batch", [
                new ResponseMessage("$edit", {
                    owner : 1,
                    message : "hello"
                }),
                "string"
            ])

            assert.throws(fn, TypeError)
        })

        it("Test type $batch then all items in options must be instance of ResponseMessage (Success)", () => {
            const rm = new ResponseMessage("$batch", [
                new ResponseMessage("$edit", {
                    owner : 1,
                    message : "hello"
                }),
                new ResponseMessage("$edit", {
                    owner : 1,
                    message : "hello"
                }),
            ])
            assert.equal(rm.bodies.length, 2)
        })

        it("Test type '$delete' doesn't have 'message'", () => {
            const r = new ResponseMessage("$delete", {
                owner: 1,
                destroy : true
            })
            assert.equal(r.message, undefined)
        })
    })

    describe("body: Test response body", () => {
        for(let tcase of tableTestAttributes){
            it(tcase.textBody, () => {
                const {input, expectedBody} = tcase
                const RM = new ResponseMessage(input.type, input.options)
                assert.deepEqual(RM.body(), expectedBody)
            })
        }

        it("Response body for type='$delete' doesn't have message", () => {
            const RM = new ResponseMessage("$delete", {
                owner: 1
            })
            assert.deepEqual(RM.body(), {
                type: "$delete",
                owner: "1",
                destroy: false,
                options:{
                    parse_mode: "Markdown",
                    reply_markup : {}
                }
            })
        })
    })

    describe("validate: Test base validator", () => {
        it("typeof type is 'string'", () => {
            const fn = () => ResponseMessage.validate(1, {
                owner: '1',
                message : 'Hello'
            })
            assert.throws(fn, TypeError("type must be a 'string'"))
        })

        it("owner is required!", () => {
            const fn = () => ResponseMessage.validate("$edit", {
                message : 'Hello'
            })
            assert.throws(fn, new FieldIsRequiredError("'owner' is required!"))
        })

        it("Message is required!", () => {
            const fn = () => ResponseMessage.validate("$edit", {
                owner: "1"
            })
            assert.throws(fn, new FieldIsRequiredError("'Message' is required!"))
        })
    })
})