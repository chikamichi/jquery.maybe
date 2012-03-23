## Maybe

*OK, Schrödinger's cat is The Maybe. Whether you love or hate her could be a Maybe too. "maybe one day" is a lurking Maybe. But at some point one's got to **specify**.*

A Maybe is an enhanced `$.Deferred` interface, featuring a simple way to specify when it should be resolved and/or rejected.

It relies on an evented conception of the deferred's associated promise lifecycle. One is expected to write down *evented conditions* triggering either the deferrable *resolution* or *rejection*. This is made possible by exposing a custom Promise to the outside world, accepting `doIf` and `failIf` condition-factories. As with other legacy Deferred's methods, several conditions may be specified.

By default, a Maybe will always succeed, but if it is provided a grace-period (with the `wait` option), it will wait until this delay is over to succeed. This period may even be infinite. In the mean time, the Promise could be either early-resolved (if an event matching a `doIf` condition occurs) or rejected (if an event matching a `failIf` condition occurs).

## Example

*Say you want to display a notification to several users connected to your application. The notification is about enforcing a setting, live, but you want to allow for a 10s delay before actually performing the action. The whole point is managing some time for the users to decide whether they really want this forced-setting to apply. During the 10s grace-period, the users should be able to reject the proposed action by clicking on a cancel button within the notification. Different choices mean different consequences in the application lifecycle.*

Using a typical, fully-fledged notification plugin, you'd create a new `Notif` object of some kind, passing content as an option to be inserted internally in some predefinite way, and you'd hook-in somehow to intercept and handle the user interaction (*click*) because, most of the time, the very "plugin" does not actually expose any kind of "hook" nor does any kind of "smart" binding for you.

Using jquery.maybe and a low-tech approach, you'd do:

``` js
$('.my_notification').maybe({wait: 10000})
                     .failIf('click', '.cancel')
                     .done(success)
                     .fail(failure)
                     .always(hide);
```
     
where `success`,`failure` and `hide` are callbacks of your choice. The first two will be called when the action is respectively resolved or rejected; `hide` will always be called, no matter what.

`failIf()` is used to attach a condition for rejection. In the example, we're listening for any click on `$('.cancel', '.my_notification')` during the 10 s lifetime of the action. If such an event occurs, the action is rejected and `success` never fires, instead `failure` then `hide` do. If no click event is fired during the grace-period, the action is resolved: `success` then `hide` are triggered, whereas `failure` never shows up.

## Available options for `maybe()`

* **wait** - in milliseconds, delay before resolving the action (default: `-1`). When `wait` is set to -1, the action is pending for an undefinite amount of time and must be resolved explicitely by matching a resolution condition (as expressed with `doIf` / `failIf`). If `wait` is set to a positive value, then this define a deadline before which the Maybe may be (haha) resolved/rejected earlier, otherwise it will be automagically resolved when the time is passed.
* **clear** - whether to clear the promise once resolved/rejected (default: `true`). See the note below.

## Custom methods available on the exposed Promise

* **failIf** - specify a condition to reject the action. This match the flat arguments (no map) flavour of `$.on()`, *without the handler* (this is jquery.maybe's job). Therefore, just pass an event (and an optionnal element):

``` js
$('.foo').maybe().failIf('my.event', '.my_element');
```

* **doIf** - specify a condition for resolving the action. Same pattern than `failIf`.

Apart from that, this is [a regular Promise](http://api.jquery.com/category/deferred-object/).

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

When using the second form, it is important to understand that the exposed promise is memoized by jquery.maybe *until* the action is either resolved or rejected, so in-between calls to `maybe()` on the same element will return the singleton promise, leading to the same result as in chaining.

## On clear

Once resolved/rejected, the notification's state would be settled, that is, the exposed promise is either resolved or rejected and remains so. When using jquery.maybe with a non-unique element such as the `.my_notification` in the previous example, this could be really annoying. Therefore by default, jquery.maybe will clear the "bound" between the element and its settled promise once resolved/rejected. A new call to `maybe()` on this element will simply generate a new promise replacing the staled one. If this is not what you want, you may pass `{clear: false}` to leave the promise in its settled state.

## License

MIT, see LICENSE.txt.
