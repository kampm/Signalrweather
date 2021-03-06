"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var NOOP = function () { };
/**
 * A token that can be passed around to inform consumers of the token that a
 * certain operation has been cancelled.
 */
var CancellationToken = /** @class */ (function () {
    function CancellationToken(
        /**
         * Whether the token is already cancelled.
         */
        _isCancelled,
        /**
         * Whether the token can be cancelled.
         */
        canBeCancelled) {
        this._isCancelled = _isCancelled;
        this.canBeCancelled = canBeCancelled;
        this._callbacks = new Set();
    }
    Object.defineProperty(CancellationToken.prototype, "isCancelled", {
        /**
         * Whether the token has been cancelled.
         */
        get: function () {
            return this._isCancelled;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CancellationToken.prototype, "reason", {
        /**
         * Why this token has been cancelled.
         */
        get: function () {
            if (this.isCancelled) {
                return this._reason;
            }
            else {
                throw new Error('This token is not cancelled.');
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Make a promise that resolves when the async operation resolves,
     * or rejects when the operation is rejected or this token is cancelled.
     */
    CancellationToken.prototype.racePromise = function (asyncOperation) {
        var _this = this;
        if (!this.canBeCancelled) {
            return asyncOperation;
        }
        return new Promise(function (resolve, reject) {
            // we could use Promise.finally here as soon as it's implemented in the major browsers
            var unregister = _this.onCancelled(function (reason) {
                return reject(new CancellationToken.CancellationError(reason));
            });
            asyncOperation.then(function (value) {
                resolve(value);
                unregister();
            }, function (err) {
                reject(err);
                unregister();
            });
        });
    };
    /**
     * Throw a {CancellationToken.CancellationError} if this token is cancelled.
     */
    CancellationToken.prototype.throwIfCancelled = function () {
        if (this._isCancelled) {
            throw new CancellationToken.CancellationError(this._reason);
        }
    };
    /**
     * Invoke the callback when this token is cancelled.
     * If this token is already cancelled, the callback is invoked immediately.
     * Returns a function that unregisters the cancellation callback.
     */
    CancellationToken.prototype.onCancelled = function (cb) {
        var _this = this;
        if (!this.canBeCancelled) {
            return NOOP;
        }
        if (this.isCancelled) {
            cb(this.reason);
            return NOOP;
        }
        this._callbacks.add(cb);
        return function () { return _this._callbacks && _this._callbacks.delete(cb); };
    };
    /**
     * Create a {CancellationToken} and a method that cancels it.
     */
    CancellationToken.create = function () {
        var token = new CancellationToken(false, true);
        var cancel = function (reason) {
            if (token._isCancelled)
                return;
            token._isCancelled = true;
            token._reason = reason;
            token._callbacks.forEach(function (cb) { return cb(reason); });
            delete token._callbacks; // release memory
        };
        return { token: token, cancel: cancel };
    };
    /**
     * Create a {CancellationToken} and a method that cancels it.
     * The token will be cancelled automatically after the specified timeout in milliseconds.
     */
    CancellationToken.timeout = function (ms) {
        var _a = CancellationToken.create(), token = _a.token, originalCancel = _a.cancel;
        var timer = setTimeout(function () { return originalCancel(CancellationToken.timeout); }, ms);
        var cancel = function (reason) {
            if (token._isCancelled)
                return;
            clearTimeout(timer);
            originalCancel(reason);
        };
        return { token: token, cancel: cancel };
    };
    /**
     * Create a {CancellationToken} that is cancelled when all of the given tokens are cancelled.
     *
     * This is like {Promise<T>.all} for {CancellationToken}s.
     */
    CancellationToken.all = function () {
        var tokens = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tokens[_i] = arguments[_i];
        }
        // If *any* of the tokens cannot be cancelled, then the token we return can never be.
        if (tokens.some(function (token) { return !token.canBeCancelled; })) {
            return CancellationToken.CONTINUE;
        }
        var combined = CancellationToken.create();
        var countdown = tokens.length;
        var handleNextTokenCancelled = function () {
            if (--countdown === 0) {
                var reasons = tokens.map(function (token) { return token._reason; });
                combined.cancel(reasons);
            }
        };
        tokens.forEach(function (token) { return token.onCancelled(handleNextTokenCancelled); });
        return combined.token;
    };
    /**
     * Create a {CancellationToken} that is cancelled when at least one of the given tokens is cancelled.
     *
     * This is like {Promise<T>.race} for {CancellationToken}s.
     */
    CancellationToken.race = function () {
        var tokens = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tokens[_i] = arguments[_i];
        }
        // If *any* of the tokens is already cancelled, immediately return that token.
        for (var _a = 0, tokens_1 = tokens; _a < tokens_1.length; _a++) {
            var token = tokens_1[_a];
            if (token._isCancelled) {
                return token;
            }
        }
        var combined = CancellationToken.create();
        var unregistrations;
        var handleAnyTokenCancelled = function (reason) {
            unregistrations.forEach(function (unregister) { return unregister(); }); // release memory
            combined.cancel(reason);
        };
        unregistrations = tokens.map(function (token) { return token.onCancelled(handleAnyTokenCancelled); });
        return combined.token;
    };
    /**
     * A cancellation token that is already cancelled.
     */
    CancellationToken.CANCELLED = new CancellationToken(true, true);
    /**
     * A cancellation token that is never cancelled.
     */
    CancellationToken.CONTINUE = new CancellationToken(false, false);
    return CancellationToken;
}());
/* istanbul ignore next */
(function (CancellationToken) {
    /**
     * The error that is thrown when a {CancellationToken} has been cancelled and a
     * consumer of the token calls {CancellationToken.throwIfCancelled} on it.
     */
    var CancellationError = /** @class */ (function (_super) {
        __extends(CancellationError, _super);
        function CancellationError(
            /**
             * The reason why the token was cancelled.
             */
            reason) {
            var _this = _super.call(this, 'Operation cancelled') || this;
            _this.reason = reason;
            Object.setPrototypeOf(_this, CancellationError.prototype);
            return _this;
        }
        return CancellationError;
    }(Error));
    CancellationToken.CancellationError = CancellationError;
})(CancellationToken || (CancellationToken = {}));
exports.default = CancellationToken;
//# sourceMappingURL=CancellationToken.js.map