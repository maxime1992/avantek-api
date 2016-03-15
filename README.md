# Avantek Node API

## What's Avantek anyway ?

Avantek proposes a [light bulb](http://goo.gl/AhFsDZ), that you can control with your IOS/Android device.
![Avantek light bulb](https://github.com/maxime1992/avantek-api/raw/master/img/light-bulb.jpg "Avantek light bulb")

## What's this repo about ?
The [Avantek application](https://goo.gl/w1XMBX) (for Android) is pretty cool but if you want more control over your device, you can use this API.

## What's available so far ?
- `var avantek = new Avantek('YOUR_AVANTEK_IP', 14580, 'YOUR_AVANTEK_SID');
` Create an Avantek object
- `avantek.on()` Switch on the light
- `avantek.off()` Switch off the light
- `avantek.changeColor(r, g, b)` Change the color of the light by passing RGB values
- `avantek.changeLum(lum)` Change the luminosity of the light (lum can take values from 0 to 255)
- `avantek.updateStatus()` Update the status of the object
