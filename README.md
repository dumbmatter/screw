# screw

Play back MP3s with altered pitch and tempo, right in your web browser. [Try it here!](http://dumbmatter.com/screw/)

## Why?

I love [chopped and screwed](https://en.wikipedia.org/wiki/Chopped_and_screwed) music. The "chopped" part requires some skill and artistry. But "screwed" just requires you turning some knobs to adjust the pitch and tempo of the music. And IMHO, just doing the "screwed" part gets you 90% of the way to a decent chopped and screwed song.

## How?

The Web Audio API includes [`Audio​Buffer​Source​Node​.playback​Rate`](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate), which lets you adjust the pitch and tempo together, similar to speeding up or slowing down a record.

But I want more! I want to be able to control pitch and tempo individually! This turns out to be a lot more complicated to do. Fortunately, I found [a library](https://github.com/also/soundtouch-js) that enabled it without too much trouble (after [a minor bug fix](https://github.com/dumbmatter/screw/commit/8a0cf73197b8705a01116c7c6e079a9b6e2e0fa0#diff-271b15df20e16debf3b6addcfdf6321e)).

## My Dream

I want this functionality in every music player. Because chopped and screwed music is awesome, and we as music listeners should be able to create it ourselves as easily as possible. Years ago I made a plugin for [my favorite media player](https://mail.gnome.org/archives/banshee-list/2013-May/msg00034.html) but bitrot has subsequently killed it. And these days there's so many media players that it seems hopeless. But I will not give up on my dream. Some day we will make it reality! In the mean time, hey, at least everybody has a web browser...
