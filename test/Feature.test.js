const assert = require('assert')
const { NotImplementedError } = require("../Error")
const { Feature } = require('../Feature')

class Foo extends Feature {
    constructor(owner){
        super(owner)
    }

    getNumber(params, context){
        return parseInt(params)
    }

    async getContextAsync(params, context){
        return new Promise((resolve, reject) => {
            const t = setTimeout(()=>{
                resolve(context)
            }, 1000)
        })
    }
}
const f = new Foo(123)

describe("Test#Feature.js", () => {
    describe("constructor: Absract class", () => {
        it("Feature is abstract class ", () => {
            const fn = () => new Feature(123)
            assert.throws(fn, new NotImplementedError("Feature class"), "cannot create instances directly")
        })

        it("Creating an instance by child class", () => {
            assert.equal(f.name, "Foo")
        })
    })

    describe("start: abstract method", () => {
        it("method 'start' must be implemented on child class.", () => {
            assert.throws(f.start, new NotImplementedError('start method'))
        })
    })

    describe("run: Actions executor", () => {
        it("Cannot execute a method that is not in its class.",  () => {
            f.run("asdfl", "params", "context").catch(e => {
                assert.equal(e.name, "Error")
            })
        })

        it("Can execute methods that are in its class", () => {
            f.run("getNumber", "100", "null").then(res => {
                assert.equal(res, 100)
            })
        })

        it("Can execute async methods that are in its class", () => {
            f.run("getContextAsync", "null", "100").then(async res => {
                assert.equal(await res, "100")
            })
        })
    })

    describe("Get Durration: How long a method running", () => {
        it("After executing the action A system sleeps for 1200ms, it is obtained that the action time is already running> = 1s", ( ) => {
            const sleep = (time) => new Promise((res, rej) => {
                setTimeout(()=> {
                    res("done")
                }, time)
            })
    
            f.run("getNumber", "100", "null").then(res => {
                sleep(1200).then(r => {
                    assert.equal(f.durration >= 1, true)
                })
            })
        })

    })

    describe("isSession Expired", () => {
        it("the session of the feature has not expired", () => {
            assert.equal(f.isSessionExpired(), false)
        })
    })

    describe("cleanupActivity", () => {
        it("Return type = '$cleanup'", ()=>{
            const {type} = f.cleanupActivity()
            assert.equal(type, "$cleanup")
        })
    })
})