const TelegramBot = require("node-telegram-bot-api");

const { decodeCallbackData } = require('./helper')
const { RESPONSE_TYPES } = require("./constants");

class Raccoon extends TelegramBot {
    /**
     * Raccoon constructor
     * 
     * @param {string} token 
     * @param {Object} options 
     */
    constructor(token, options) {
        super(token, options);

        // Stores all features that is registered.
        // { owner : { feature_name : feature_instance }}
        this.activityState = {};
        this.activeActivities = new Set([]) // token storage
        this.debug = true; // flag that indicate debug mode on/off
    }

    /**
     * Register features to ActivityState to be called later
     * 
     * @param {any} owner  -  owner of features
     * @param {Feature} feature - instance of Feature Class
     */
    registerFeature(owner, feature) {
        if (owner == undefined || feature == undefined)
            throw new Error(`owner or feature undefined`);

        const _owner = owner.toString();
        const token  = this.getToken(_owner, feature.name)

        if(this.isActivityActive(token)){
            if(this.debug) console.log(`Register :: ${feature.name} is running`)
            return token
        }

        if (this.activityState[_owner] === undefined) {
            this.activityState[_owner] = {};
        }
        this.activityState[_owner][feature.name] = feature;
        return token
    }

    /** create token */
    getToken(owner, featureName){
        return  owner + featureName
    }

    /**
     * check token is active
     * @param {string} token 
     */
    isActivityActive(token){
        return this.activeActivities.has(token)
    }

    /**
     * activate token
     * @param {string} token 
     */
    activateActivity(token){
        this.activeActivities.add(token)
    }

    /**
     * deactivate token
     * @param {string} token 
     */
    deactivateActivity(token){
        this.activeActivities.delete(token)
    }
    /**
     * Starting a feature as an activity
     * 
     * @param {string} token 
     * @param {Feature} feature 
     */
    async start(token, feature) {
        if(this.isActivityActive(token)){
            if(this.debug) console.log(`${feature.name} is running`)
            return
        }
        const response = await feature.start();
        const { owner, message, options } = response.body();
        this.sendMessage(owner, message, options);
        this.activateActivity(token)
    }

    /** Watch callback queries from every keyboard in the feature class */
    watchFeatureCallback() {
        this.on("callback_query", context => {
            this._handleCallbackQuery(context);
        });
    }

    /**
     * Returns activities based on owner and feature names
     * 
     * @param {string} owner 
     * @param {string} name 
     */
    getActivity(owner, name) {
        if (this.activityState[owner] === undefined) {
            throw new Error(`Owner '${owner}' does't have activity.`);
        }

        const activity = this.activityState[owner][name];
        if (activity === undefined) {
            throw new Error(
                `Owner '${owner}' doesn't have activity '${name}'.`
            );
        }

        return activity;
    }

    /**
     * Handles actions from callback data
     * @param {Object} context 
     */
    async _handleCallbackQuery(context) {
        const { method, params, featureName, owner } = decodeCallbackData(
            context.data
        );

        const activity = this.getActivity(owner, featureName);

        if (activity.isSessionExpired()) {
            this.answerCallbackQuery(context.id, { text: "Session Over!" });
            this.deleteMessage(context.from.id, context.message.message_id)
            this.cleanup(owner, featureName);
            return;
        }

        const response = await activity.run(method, params, context);
        const responseBody = response.body()
        this._handleResponse(responseBody, context);
        if(responseBody != undefined){
            if (responseBody.destroy && responseBody.destroy == true) {
                if(this.debug) console.log(this.activityState[owner])
                this.cleanup(owner, featureName);
            }
        }
    }

    /**
     * Handling responses based on a template
     * 
     * @param {ResponseMessage} response 
     * @param {Object} context 
     */
    _handleResponse(response, context) {
        if (response === undefined) return;

        const type = response.type;
        if (type == undefined) throw new Error("Response type is required!");

        if (!RESPONSE_TYPES.has(type)) throw new Error("Unknown response type");

        this[type].call(this, response, context);
    }

    /**
     * Send messages to the telegram
     * @param {ResponseMessage} resp 
     */
    $send(resp) {
        this.sendMessage(resp.owner, resp.message, resp.options);
    }

    /**
     * Edit telegram message
     * @param {ResponseMessage} resp 
     * @param {Object} context 
     */
    $edit(resp, context) {
        this.editMessageText(resp.message, {
            message_id: context.message.message_id,
            chat_id: resp.owner,
            ...resp.options
        }).catch(error => {
            if (!this.debug) return
            if(error.code == 'ETELEGRAM'){
                console.error("ERROR", "400 Bad Request: message is not modified")
            }else{
                console.error("$edit ::", error);
            }
        });
    }

    /**
     * Delete telegram message
     * @param {ResponseMessage} resp 
     * @param {Object} context 
     */
    $delete(resp, context) {
        this.deleteMessage(resp.owner, context.message.message_id).catch(error => {
            if(this.debug) console.error("$delete ::", error);
        });
    }

    /**
     * Send answer callbackQuery
     * @param {ResponseMessage} resp 
     * @param {Object} context 
     */
    $answer(resp, context) {
        this.answerCallbackQuery(context.id, { text: resp.message });
    }

    /**
     * Remove activity from state
     * @param {string} owner 
     * @param {string} name 
     */
    cleanup(owner, name) {
        this.deactivateActivity(this.getToken(owner, name))
        delete this.activityState[owner][name];
        if (Object.keys(this.activityState[owner]).length == 0)
            delete this.activityState[owner];
        if(this.debug){
            console.log("After cleanup state", this.activityState[owner])
        }
        
    }
}

module.exports = {
    Raccoon
};
