const TelegramBot = require("node-telegram-bot-api");

const utils = require('./utils')
const { NotImplementedError } = require('./Error')
const {
    FEATURE_PREFIX_SEPARATOR,
    FEATURE_TIME_OUT,
    RESPONSE_TYPES
} = require("./constants");

class Feature {
    /**
     * Abstract class
     * 
     * Every feature that will be used on Raccoon must be extends to the Feature class
     * @constructor
     * @param {any} id - A unique identity that distinguishes each feature from a different owner
     */
    constructor(id) {
        if (this.constructor === Feature) {
            throw new NotImplementedError("Feature class");
        }

        this.id = id;
        this.name = this.constructor.name; // feature name
        this.prefix = `${this.name}${FEATURE_PREFIX_SEPARATOR}${this.id}`; // prefix for callback data on keyboard
        this.createdAt = new Date().getTime(); // to calculate how long a method has been executed.
        
    }

    /**
     * Abstract Method
     * Methods must be implemented in classes that extend to the Feature class. 
     * 
     * The start method is the method used to initialize the first response of a feature instance.
     * Returns the response template.
     */
    start() {
        throw new NotImplementedError(`start method`);
    }

    /**
     * Executes the methods available on the feature Object by using the method name
     * 
     * @param {string} method 
     * @param {string} params 
     * @param {any} context 
     * 
     */
    async run(method, params, context) {
        const func = this[method];
        if (func === undefined) {
            throw new Error(
                `Feature ${this.name} doesn't have method '${method}'`
            );
        }

        this.createdAt = new Date().getTime(); // updating the time the method is called
        return func.call(this, params, context);
    }

    /** calculate how long a method is running */
    get durration() {
        const current = new Date().getTime();
        return (current - this.createdAt) / 1000;
    }

    /** Returns true if the method has been running longer than session time */
    isSessionExpired() {
        return this.durration >= FEATURE_TIME_OUT;
    }

    /** Tells 'Raccoons' to immediately remove expired methods from the activity state  */
    cleanupActivity() {
        return {
            type: "$cleanup",
            id: this.id
        };
    }
}

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
    async start(token,feature) {
        if(this.isActivityActive(token)){
            if(this.debug) console.log(`${feature.name} is running`)
            return
        }
        const response = await feature.start();
        const { id, message, options } = response;
        this.sendMessage(id, message, options);
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
        const { method, params, featureName, owner } = utils.decodeCallbackData(
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
        this._handleResponse(response, context);

        if (response.destroy && response.destroy == true) {
            if(this.debug) console.log(this.activityState[owner])
            this.cleanup(owner, featureName);
        }
    }

    /**
     * Handling responses based on a template
     * 
     * @param {Object} response 
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
     * @param {Object} resp 
     */
    $send(resp) {
        this.sendMessage(resp.id, resp.message, resp.options);
    }

    /**
     * Edit telegram message
     * @param {Object} resp 
     * @param {Object} context 
     */
    $edit(resp, context) {
        this.editMessageText(resp.message, {
            message_id: context.message.message_id,
            chat_id: resp.id,
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
     * @param {Object} resp 
     * @param {Object} context 
     */
    $delete(resp, context) {
        this.deleteMessage(resp.id, context.message.message_id).catch(error => {
            if(this.debug) console.error("$delete ::", error);
        });
    }

    /**
     * Send answer callbackQuery
     * @param {Object} resp 
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
    Raccoon,
    Feature
};
