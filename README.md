# kcRotateDial

A lightweight, vanilla JavaScript rotary dial control with smooth dragging, inertia, easing, and step snapping.

## Description

kcRotateDial is a pure JavaScript rotary dial component, originally created around the year 2010. It allows users to click or drag to rotate an element smoothly, supports inertia for natural motion, easing animations for programmatic value setting, and optional step snapping.

This control was pioneering for its time, inspiring other developers and projects long before similar solutions existed.

It is now updated for modern times.

## Demo

http://kaisarcode.com/resources/demos/kc-rotate-dial/demo.html

## Features

- No dependencies (vanilla JS)
- Smooth rotation with mouse and touch support
- Inertia-based momentum after drag release
- Optional easing animation for programmatic rotation
- Step snapping for discrete increments
- Tracks full rotations beyond 360 degrees
- Customizable callbacks for value change and step events
- Lightweight and modular class design

## Usage

1. Clone or download the source:

```bash
git clone https://github.com/kaisarcode/kc-rotate-dial.git
```

2. Include the script in your HTML:

```html
<script src="kc-rotate-dial.js"></script>
```

3. Add your dial element in HTML:

```html
<div id="myDial" style="width:100px; height:100px; background:#ccc; border-radius:50%;"></div>
```

4. Initialize the dial in JavaScript:

```js
const dial = new KcRotateDial(document.getElementById('myDial'), {
    easing: true,
    step: 10,
    inertia: true,
    inertiaFriction: 0.9
});

dial.onchange = () => {
    console.log(`Rotation degrees: ${dial.deg.toFixed(2)}`);
};

dial.onstep = (stepValue) => {
    console.log(`Snapped step: ${stepValue}`);
};
```

5. To programmatically set rotation:

```js
dial.setValue(90); // Rotate to 90 degrees with easing if enabled
```

### Configuration Options

- **easing (Boolean, default: false):** Enables easing animation when setting value programmatically.
- **step (Number, default: 0):** Snap rotation to increments of degrees (e.g. 10 = snap every 10°).
- **inertia (Boolean, default: false):** Enables momentum/inertia after drag release.
- **inertiaFriction (Number, default: 0.95):** Friction factor to slow inertia over time (0-1).

### Methods

- **setValue(degrees):** Rotates the dial to specified degrees with easing if enabled.

### Events / Callbacks

- **onchange:** Called on every rotation change, useful for updating UI or state.
- **onstep:** Called when rotation snaps to a step increment.

## License

[![GPLv3](https://www.gnu.org/graphics/gplv3-127x51.png)](https://www.gnu.org/licenses/gpl-3.0.html)

This project is licensed under the **GNU General Public License version 3 (GPLv3)**.
