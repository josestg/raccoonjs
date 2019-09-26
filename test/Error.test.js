const assert = require('assert')
const { NotImplementedError, FieldIsRequiredError } = require("../Error")

describe("Test#Error.js", () => {
    it("NotImplementedError", () => {
        const e = new NotImplementedError("A")
        assert.equal(e.name, "NotImplementedError")
        assert.equal(e.message, "Not Implemented A")
    })

    it("FieldIsRequiredError", () => {
        const e = new FieldIsRequiredError("A")
        assert.equal(e.name, "FieldIsRequiredError")
        assert.equal(e.message, "A")
    })
})