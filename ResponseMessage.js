const { FieldIsRequiredError } = require('./Error')
class ResponseMessage {
    /**
     * Response Message is a response template that will be rendered into a telegram message.
     * 
     * Response Message constructor
     * @param {string} type 
     * @param {object} options 
     */
    constructor(type, options){
        this.type = type
        if(type == "$batch"){
            if(!Array.isArray(options))
                throw new TypeError("Options for type $batch must be an Array.")
            
            for(let e of options){
                if(e instanceof ResponseMessage && e.constructor == ResponseMessage) continue
                throw new TypeError("All items in option must be an instance of ResponseMessage")
            }
            this.bodies = options
            return this
        }
        
        ResponseMessage.validate(type, options)
        this.owner = options.owner
        this.destroy = options.destroy || false
        this.keyboard = options.keyboard || null
        this.parseMode = options.parse_mode || 'Markdown'
        this.inlineKeyboard = options.inline_keyboard || null
        if(type != "$delete" ) this.message = options.message
    }

    /**
     * Return response message body. 
     */
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

    /**
     * Validate parameters for Response Message
     * 
     * @param {string} type 
     * @param {object} options 
     */
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
