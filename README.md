## Maybe

*Schrödinger's cat would be the ultimate Maybe, man.*

Let me introduce the highly respectable Maybe. It is an enhanced `$.Deferred` interface, featuring a simple way to specify *when* and *why* it should be resolved and/or rejected. It really tries to be a more expressive, less all-around alternative to [jQuery.when](http://api.jquery.com/jQuery.when/) (If you want to know about Deferred or refresh your knowledge, head to [this review](http://eng.wealthfront.com/2012/12/jquerydeferred-is-most-important-client.html) and [the doc](http://api.jquery.com/category/deferred-object/)).

This custom interface relies on a fully evented interface for the promise object associated to the deferrable. When using a Maybe, one is expected to specify *evented conditions for success and failure*. Those conditions, if and when matched, will trigger the deferrable's *resolution* or *rejection* callbacks accordingly.

This feature is made possible by exposing a custom Promise to the outside world that accepts `doIf` and `failIf` helpers to specify the aforementioned evented conditions.

By default, a Maybe will wait for an event to occur, managing a so-called "infinite grace-period". One can specify a finite timeout instead, in which case the Maybe will wait until this delay is over to succeed. In both cases, the Maybe can be either early-resolved (`doIf`) or early-rejected (`failIf`).

## Example

*Say you are the admin of a real-time, collaborative webapp. You want to enforce a setting to all users, but you would be kind enough to make this a proposal and let them discard it. That means, displaying a notification to them, asking whether they want to apply the change. There would be a 10s delay before actually performing the update, because 10s is enough time for boorish users to refuse your kind proposal by clicking on this doomed "Cancel" button.*

Using jquery.maybe, you would simply write:

``` js
$('.my_notification').maybe({wait: 10000})
                     .failIf('click', '.cancel')
                     .done(success)
                     .fail(failure)
                     .always(hide);
```
     
where `success`,`failure` and `hide` are callbacks of your choice. The first two will be called when the action is respectively resolved or rejected; `hide` will always be called, no matter what.

`failIf()` is used to attach a condition for rejection. In the example, we're listening for a click on `$('.cancel', '.my_notification')` during the 10 s lifetime of the timeout. If such an event occurs, the action is rejected and `success` never fires; instead, `failure` then `hide` do fire. If no click event is catched while in the grace-period, the action ends up being resolved: `success` then `hide` are triggered, whereas `failure` never shows up.

## Available options for `maybe()`

* **wait** - in milliseconds, the delay before resolving in success (default: `-1`). When `wait` is set to -1, the action is pending for ever and must be resolved explicitly, so one is expected to provide resolution conditions with `doIf` / `failIf`. If `wait` is set to a positive value, it specifies a timeout before which the Maybe may be (haha!) resolved/rejected; otherwise, it will be automagically resolved in success when the time is over.
* **clear** - whether to forget about the promise once resolved/rejected (default: `true`). See the note below.

## Custom methods available on the exposed Promise

* **failIf** - specifies a condition for rejecting the action. The signature matches the flat arguments' flavour of `$.on()`:

``` js
$('.foo').maybe().failIf('my.event', '.my_element');
```

* **doIf** - specifies a condition for resolving the action. Same pattern as `failIf`.

Apart from that, this is [a regular Promise](http://api.jquery.com/category/deferred-object/) as defined by jQuery!

Note that, when initializing the plugin, one may either chain methods:

``` js
$('.my_notification').maybe(// options).done(// cb).fail(// cb);
```

or not:

``` js
$('.my_notification').maybe(// options);
$('.my_notification').done(// callback);
$('.my_notification').fail(// callback);
```

When using the second form, it is important to understand that the exposed promise is memoized by jquery.maybe *until* the action is either resolved or rejected, so in-between calls to `maybe()` on the same element will return the singleton promise, which hopefully leads to the same result as the chaining method.

## On clear

In our example, once resolved or rejected, using legacy Deferred's behavior, the notification's state would be settled. That is, the exposed promise would be either resolved or rejected, *and would remain so forever*. When using jquery.maybe with a non-unique element, such as the `.my_notification` in the previous example (there could be several notifications displayed at once!), it could turn really annoying. I think this is the typical use-case, therefore by default, jquery.maybe will clear the "binding" between the element and its now-settled promise/maybe. A new call to `maybe()` on this element will simply generate a new, viviv folk, replacing the staled one. If this is not what you want, you can pass `{clear: false}` in the options to leave the promise in peace and stare at it dead until you die too.

## License

MIT, see LICENSE.txt.
