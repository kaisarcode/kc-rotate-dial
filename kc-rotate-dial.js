/**
 * KcRotateDial - A custom rotatable dial component.
 *
 * Copyright (c) 2025, KaisarCode <kaisar@kaisarcode.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

class KcRotateDial {
    constructor(elem, config = {}) {
        this.elem = elem;
        this.rad = 0;
        this.deg = 0;
        this.per = 0;
        this.fullRad = 0;
        this.fullDeg = 0;
        this.fullPer = 0;
        this.spin = 0;
        this.clock = false;

        this.maxRad = 2 * Math.PI;
        this.maxDeg = 360;
        this.maxPer = 100;

        this.drag = false;
        this.axis = [0, 0];
        this.size = [0, 0];
        this.cursor = [0, 0];
        this.radInternal = 0;
        this.lastRad = 0;
        this.lastPer = 0;
        this.lastFullRad = 0;
        this.velocity = 0;
        this.lastTimestamp = 0;
        this.animFrame = null;

        this.easing = config.easing || false;
        this.step = config.step || 0;
        this.inertia = config.inertia || false;
        this.inertiaFriction = config.inertiaFriction || 0.9;

        this.onchange = () => {};
        this.onstep = () => {};

        elem.style.transformOrigin = 'center center';

        this.initEvents();
    }

    initEvents() {
        this.elem.addEventListener('mousedown', e => this.setDrag(e, true));
        document.addEventListener('mouseup', e => this.setDrag(e, false));
        document.addEventListener('mousemove', e => this.rotate(e));
        document.addEventListener('touchstart', e => this.setDrag(e, true));
        document.addEventListener('touchend', e => this.setDrag(e, false));
        document.addEventListener('touchmove', e => this.rotate(e), { passive: false });
    }

    getAxis() {
        const rect = this.elem.getBoundingClientRect();
        return [rect.left + rect.width / 2 + window.scrollX, rect.top + rect.height / 2 + window.scrollY];
    }

    getCursorPos(e) {
        if (e.touches && e.touches[0]) return [e.touches[0].pageX, e.touches[0].pageY];
        return [e.pageX, e.pageY];
    }

    getAngle(e) {
        this.axis = this.getAxis();
        this.cursor = this.getCursorPos(e);
        let rad = Math.atan2(this.cursor[1] - this.axis[1], this.cursor[0] - this.axis[0]);
        rad += Math.PI / 2;
        if (rad < 0) rad += this.maxRad;
        return rad;
    }

    setDrag(e, state) {
        e.preventDefault();
        if (state) {
            this.radInternal = this.getAngle(e);
            this.drag = true;
            cancelAnimationFrame(this.animFrame);
            this.velocity = 0;
            this.lastTimestamp = performance.now();
        } else {
            this.drag = false;
            if (this.inertia && Math.abs(this.velocity) > 0.001) {
                this.startInertia();
            }
        }
    }

    rotate(e) {
        if (!this.drag) return;
        if (e.cancelable) e.preventDefault();

        const now = performance.now();
        const angle = this.getAngle(e);
        const relative = angle - this.radInternal;
        let rotation = this.lastRad + relative;

        if (rotation < 0) rotation += this.maxRad;
        if (rotation > this.maxRad) rotation -= this.maxRad;

        this.radInternal = angle;
        this.applyRotation(rotation);

        const deltaRad = rotation - this.lastRad;
        const dt = now - this.lastTimestamp || 16;
        this.velocity = deltaRad / (dt / 1000);
        this.lastTimestamp = now;

        this.lastRad = rotation;
    }

    applyRotation(rad) {
        if (this.step) {
            const stepRad = (this.step * this.maxRad) / this.maxDeg;
            rad = Math.round(rad / stepRad) * stepRad;
        }

        this.elem.style.transform = `rotate(${rad}rad)`;

        this.rad = rad;
        this.deg = (rad * this.maxDeg) / this.maxRad;
        this.per = (rad * this.maxPer) / this.maxRad;

        if ((this.lastPer <= 100 && this.lastPer >= 60) && (this.per >= 0 && this.per <= 30)) this.spin++;
        if ((this.lastPer <= 30 && this.lastPer >= 0) && (this.per >= 60 && this.per <= 100)) this.spin--;

        this.fullRad = this.rad + (this.maxRad * this.spin);
        this.fullDeg = this.deg + (this.maxDeg * this.spin);
        this.fullPer = this.per + (this.maxPer * this.spin);

        this.clock = this.lastFullRad < this.fullRad;
        this.lastPer = this.per;
        this.lastFullRad = this.fullRad;

        this.onchange();

        if (this.step) {
            const stepRad = (this.step * this.maxRad) / this.maxDeg;
            const stepIndex = Math.round(this.rad / stepRad);
            this.onstep(this.step * stepIndex);
        }
    }

    setValue(deg) {
        const correctedDeg = deg / 2;
        const targetRad = (correctedDeg / this.maxDeg) * this.maxRad;

        if (this.easing) {
            const startRad = this.rad;
            const delta = targetRad - startRad;
            const duration = 200;
            const startTime = performance.now();

            const animate = (now) => {
                const t = Math.min((now - startTime) / duration, 1);
                const eased = startRad + delta * this.easeOutQuad(t);
                this.applyRotation(eased);
                if (t < 1) {
                    this.animFrame = requestAnimationFrame(animate);
                } else {
                    this.lastRad = targetRad;
                    this.radInternal = targetRad;
                }
            };

            cancelAnimationFrame(this.animFrame);
            this.animFrame = requestAnimationFrame(animate);
        } else {
            this.applyRotation(targetRad);
            this.lastRad = targetRad;
            this.radInternal = targetRad;
        }
    }

    startInertia() {
        cancelAnimationFrame(this.animFrame);
        const stepSize = (this.step * this.maxRad) / this.maxDeg;

        const step = () => {
            this.velocity *= this.inertiaFriction;
            if (Math.abs(this.velocity) < 0.001) {
                const snapped = Math.round(this.rad / stepSize) * stepSize;
                this.applyRotation(snapped);
                this.radInternal = snapped;
                this.velocity = 0;
                if (this.onstep) {
                    this.onstep(this.step * Math.round(snapped / stepSize));
                }
                return;
            }
            const newRad = this.rad + this.velocity * (1 / 60);
            this.applyRotation(newRad);
            this.animFrame = requestAnimationFrame(step);
        };

        this.animFrame = requestAnimationFrame(step);
    }

    easeOutQuad(t) {
        return t * (2 - t);
    }
}
