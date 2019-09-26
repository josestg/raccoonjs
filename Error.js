

class NotImplementedError extends Error {
    constructor(what){
        const message  = "Not Implemented " + what
        super(message)
        this.name = this.constructor.name
    }
}

class FieldIsRequiredError extends Error {
    constructor(message){
        super(message)
        this.name = this.constructor.name
    }
}


module.exports = {
    NotImplementedError,
    FieldIsRequiredError
}