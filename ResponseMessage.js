class ResponseMessage {
    constructor(type, options){
        const {errors, ok} = this.__validate(type, options)
        if(!ok) throw new Error(errors.toString())
        
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

    __validate(type, options){
        const errors = []
        let ok = true
        if(typeof type != 'string') {
            errors.push("type must be a 'string'")
            ok = false
        }
            
        
        if(options.owner == undefined){
            errors.push("'owner' is required!")
            ok = false
        }
            
        if(type != "$delete" && options.message == undefined){
            errors.push('Message is required!')
            ok = false
        }
            
        return {errors, ok}

    }
}

module.exports = {
    ResponseMessage
}
