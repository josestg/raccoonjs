const { FieldIsRequiredError } = require('./Error')
class ResponseMessage {
    constructor(type, options){
        ResponseMessage.validate(type, options)

        this.type = type
        this.owner = options.owner
        this.destroy = options.destroy || false
        this.keyboard = options.keyboard || null
        this.parseMode = options.parse_mode || 'Markdown'
        this.inlineKeyboard = options.inline_keyboard || null

        if(type != "$delete" ) this.message = options.message

    }

    body(){
        const options = { 
            parse_mode : this.parseMode,
            reply_markup: {} 
        }
        const base = {
            owner: this.owner,
            type : this.type,
            destroy: this.destroy
        }

        if(this.type != "$delete") base['message'] = this.message
        if(this.keyboard != null)
            options.reply_markup['keyboard'] = this.keyboard

        if(this.inlineKeyboard != null )
            options.reply_markup['inline_keyboard'] = this.inlineKeyboard

        return {
            ...base,
            options
        }

        
    }

    static validate(type, options){
        if(typeof type != 'string') 
            throw new TypeError("type must be a 'string'")
        
        if(options.owner == undefined)
            throw new FieldIsRequiredError("'owner' is required!")
            
        if(type != "$delete" && options.message == undefined)
            throw new FieldIsRequiredError("'Message' is required!")  
            
    }
}

module.exports = {
    ResponseMessage
}
