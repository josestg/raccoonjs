const {
    CALLBACK_DATA_SEPARATOR,
    FEATURE_PREFIX_SEPARATOR,
    FEATURE_TIME_OUT,
    RESPONSE_TYPES
} = require("./constants");

const TelegramBot = require("node-telegram-bot-api");

function decodeCallbackData(data) {
    const [prefix, method, params] = data.split(CALLBACK_DATA_SEPARATOR);
    const [featureName, owner] = prefix.split(FEATURE_PREFIX_SEPARATOR);
    return { prefix, method, params, featureName, owner };
}

class Feature {
    constructor(id) {
        if (this.constructor === Feature) {
            throw new Error("Abstract class can't be instantiated directly.");
        }

        this.id = id;
        this.name = this.constructor.name;
        this.prefix = `${this.name}${FEATURE_PREFIX_SEPARATOR}${this.id}`;
        this.createdAt = new Date().getTime();
    }

    start() {
        throw new Error(`Method 'start' on ${this.name} haven't implemented`);
    }

    async run(method, params, context) {
        const func = this[method];
        if (func === undefined) {
            throw new Error(
                `Feature ${this.name} doesn't have method '${method}'`
            );
        }

        this.createdAt = new Date().getTime();
        return func.call(this, params, context);
    }

    get durration() {
        const current = new Date().getTime();
        return (current - this.createdAt) / 1000;
    }

    isSessionExpired() {
        return this.durration >= FEATURE_TIME_OUT;
    }

    cleanupActivity() {
        return {
            type: "$cleanup",
            id: this.id
        };
    }
}

class Raccoon extends TelegramBot {
    constructor(token, options) {
        super(token, options);

        // Stores all features that is registered.
        // { owner : { feature_name : feature_instance }}
        this.activityState = {};

        this.debug = true;
    }

    registerFeature(owner, feature) {
        if (owner == undefined || feature == undefined)
            throw new Error(`owner or feature undefined`);

        const _owner = owner.toString();
        if (this.activityState[_owner] === undefined) {
            this.activityState[_owner] = {};
        }
        this.activityState[_owner][feature.name] = feature;
    }

    async start(feature) {
        const response = await feature.start();
        const { id, message, options } = response;
        this.sendMessage(id, message, options);
    }

    watchFeatureCallback() {
        this.on("callback_query", context => {
            this._handleCallbackQuery(context);
        });
    }

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

    async _handleCallbackQuery(context) {
        const { method, params, featureName, owner } = decodeCallbackData(
            context.data
        );

        const activity = this.getActivity(owner, featureName);

        if (activity.isSessionExpired()) {
            this.answerCallbackQuery(context.id, { text: "Session Over!" });
            this.cleanup(owner, featureName);
            return;
        }

        const response = await activity.run(method, params, context);
        this._handleResponse(response, context);

        if (response.destroy && response.destroy == true) {
            this.cleanup(owner, featureName);
        }
    }

    _handleResponse(response, context) {
        if (response === undefined) return;

        const type = response.type;
        if (type == undefined) throw new Error("Response type is required!");

        if (!RESPONSE_TYPES.has(type)) throw new Error("Unknown response type");

        this[type].call(this, response, context);
    }

    $send(resp) {
        this.sendMessage(resp.id, resp.message, resp.options);
    }

    $edit(resp, context) {
        this.editMessageText(resp.message, {
            message_id: context.message.message_id,
            chat_id: resp.id,
            ...resp.options
        }).catch(error => {
            console.error("$edit ::", error);
        });
    }

    $delete(resp, context) {
        this.deleteMessage(resp.id, context.message.message_id).catch(error => {
            console.error("$delete ::", error);
        });
    }

    $answer(resp, context) {
        this.answerCallbackQuery(context.id, { text: resp.message });
    }

    cleanup(owner, name) {
        delete this.activityState[owner][name];
        if (Object.keys(this.activityState[owner]).length == 0)
            delete this.activityState[owner];
    }
}

module.exports = {
    Raccoon,
    Feature
};
