/**
 * jQuery Maybe Plugin v0.1
 * Release: 21/03/2012
 * Author: Jean-Denis Vauguet <jd@vauguet.fr>
 *
 * http://github.com/chikamichi/jquery.maybe
 *
 * Licensed under the MIT licenses:
 * http://www.opensource.org/licenses/mit-license.php
 */
(function($, window, document) {
  var $this,
      _settings = {clear: true};

  /**
   * Public interface. Using the standard jQuery-way, these methods are expected
   * to be called using the plugin proxification mechanism.
   * @see http://docs.jquery.com/Plugins/Authoring
   */
  var methods = {
    /**
     * Inits the plugin.
     *
     * It is memoized until the action is either resolved or rejected, so in-between calls
     * to $.fn.maybe() on the same element will return the associated singleton promise.
     *
     * Returns a tailored Promise (see documentation).
     */
    init: function(options) {
      $this = $this || $(this);
      if ($this._maybe) return $this._maybe.promise();

      $.extend(_settings, (options || {}));
      $this._maybe = new $.Deferred();
      _internals.customPromise();
      _internals.resolveLater();
      return $this._maybe.promise();
    }
  };

  /**
   * Private implementation.
   */
  var _internals = {
    /**
     * Registers a delayed resolving callback, to be called after options.wait
     * milliseconds (or immediately, ie. after 0 ms, if no delay was provided).
     */
    resolveLater: function() {
      if (!_settings.wait) _settings.wait = -1;
      if (_settings.wait < 0) return;
      $this._maybe.delayedResolver = window.setTimeout(_internals.resolver, _settings.wait);
    },

    /**
     * The plugin exposes a Promise object extended with two methods: failIf & doIf.
     */
    customPromise: function() {
      var promise = $this._maybe.promise();
      promise.failIf = function(event, element) {
        $this.on(event, element, _internals.rejecter);
        return promise;
      };
      promise.doIf = function(event, element) {
        $this.on(event, element, _internals.resolver);
        return promise;
      };
    },

    /**
     * Resolves the pending deferred action.
     */
    resolver: function() {
      $this._maybe.resolve();
      if (_settings.clear) _internals.clear();
    },

    /**
     * Rejects the pending deferred action.
     */
    rejecter: function() {
      window.clearTimeout($this._maybe.delayedResolver);
      delete $this._maybe.delayedResolver;
      $this._maybe.reject();
      if (_settings.clear) _internals.clear();
    },

    /**
     * Providing the {clear: true} option will ensure the internal deferred will be
     * destroyed in any case. This comes in handy when the element is not to be destroyed,
     * or it's been accessed by a generic class rather than an ID, otherwise the memoized
     * promise interface remains settled after the first resolve/reject cycle.
     */
    clear: function() {
      $this._maybe.always(function() {
          $this = void 0;
      });
    }
  };

  $.fn.maybe = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jquery.maybe');
    }     
  };
})(jQuery, window, document);
