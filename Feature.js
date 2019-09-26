const { NotImplementedError } = require('./Error');
const { FEATURE_PREFIX_SEPARATOR, FEATURE_TIME_OUT } = require("./constants");

class Feature {
    /**
     * Abstract class
     *
     * Every feature that will be used on Raccoon must be extends to the Feature class
     * @constructor
     * @param {any} owner - A unique identity that distinguishes each feature from a different owner
     */
    constructor(owner) {
        if (this.constructor === Feature) {
            throw new NotImplementedError("Feature class");
        }
        this.owner = owner;
        this.name = this.constructor.name; // feature name
        this.prefix = `${this.name}${FEATURE_PREFIX_SEPARATOR}${this.owner}`; // prefix for callback data on keyboard
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
            throw new Error(`Feature ${this.name} doesn't have method '${method}'`);
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
            owner: this.owner
        };
    }
}

module.exports = {
    Feature
}
