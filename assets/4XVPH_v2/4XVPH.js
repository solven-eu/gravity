// https://stackoverflow.com/questions/23586195/n-body-gravity-simulation-in-javascript/23671054#23671054

var Vector = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Vector.prototype = { // typeof VAR === "object" | VAR instanceof Vector
    constructor: Vector,

    set: function (set) {
        if (typeof set === "object") {
            this.x = set.x;
            this.y = set.y;
        } else {
            this.x = set;
            this.y = set;
        }

        return this;
    },

    equals: function (v) {
        return (v.x === this.x) && (v.y === this.y);
    },

    clone: function () {
        return new Vector(this.x, this.y);
    },

    mul: function (mul) {
        if (typeof mul === "object") {
            return new Vector(this.x * mul.x, this.y * mul.y);
        } else {
            return new Vector(this.x * mul, this.y * mul);
        }
    },

    div: function (div) {
        return new Vector(this.x / div, this.y / div);
    },

    add: function (add) {
        if (typeof add === "object") {
            return new Vector(this.x + add.x, this.y + add.y);
        } else {
            return new Vector(this.x + add, this.y + add);
        }
    },

    sub: function (sub) {
        if (typeof sub === "object") {
            return new Vector(this.x - sub.x, this.y - sub.y);
        } else {
            return new Vector(this.x - sub, this.y - sub);
        }
    },

    reverse: function () {
        return this.mul(-1);
    },

    abs: function () {
        return new Vector(Math.abs(this.x), Math.abs(this.y));
    },

    dot: function (v) {
        return (this.x * v.x + this.y * v.y);
    },

    length: function () {
        return Math.sqrt(this.dot(this));
    },

    lengthSq: function () {
        return this.dot(this);
    },

    setLength: function (l) {
        return this.normalize().mul(l);
    },

    lerp: function (v, s) {
        return new Vector(this.x + (v.x - this.x) * s, this.y + (v.y - this.y) * s);
    },

    normalize: function () {
        return this.div(this.length());
    },

    truncate: function (max) {
        if (this.length() > max) {
            return this.normalize().mul(max);
        } else {
            return this;
        }
    },

    dist: function (v) {
        return Math.sqrt(this.distSq(v));
    },

    distSq: function (v) {
        var dx = this.x - v.x,
            dy = this.y - v.y;
        return dx * dx + dy * dy;
    },

    cross: function (v) {
        return this.x * v.y - this.y * v.x;
    }
};

if (typeof Math.sign == "undefined") {
    Math.sign = function (x) {
        return x === 0 ? 0 : x > 0 ? 1 : -1;
    };
}











var Circle = function (c, r, v = new Vector()) {
    // c for coordinates
    this.c = c;
    // r for rayon
    this.r = r;
    // m for superficie
    this.m = r * r * Math.PI;
    // v for vitesse
    this.v = v;
    // a for acceleration
    this.a = new Vector();
};


function checkCCCol(a, b) {
    var d = distanceVector(a, b);
    var normSquared = d.lengthSq();

    var r = a.r + b.r;
    if (normSquared < r * r) {
        return true;
    } else {
        return false;
    }
}

function resCCCol(a, b) {
    var d = distanceVector(a, b);

    d.set(d.normalize());

    // the velocity of b relative of a
    // the velocity of b considering a has no speed/is fixed
    var v = b.v.sub(a.v);

    var dot = d.dot(v);

    if (dot >= 0) {
        // current velocity of b relative to a means b is getting nearer to a
        // but the objects are touching: we considerer an exchange of cinetic energy

        // totalMass
        var tm = a.m + b.m;

        // transferred cinetic energy
        var c = d.mul(2 * dot / tm);

        a.v.set(a.v.add(c.mul(b.m)));
        b.v.set(b.v.sub(c.mul(a.m)));
    } else {
        // The 2 objects are touching/imbricated (given `checkCCCol` returned true and triggered this call)
        // but these objects are already moving away from each other
    }
}










var RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    // TODO Does it mean 60 times for 1 second?
    // It seems to rather means: wait 1/60th of a second before actually computing the rendering
    // BEWARE: Does it means many callbacks can be pending, and computing on the same state?
    window.setTimeout(callback, 1000 / 60);
};



var gravity = 0.1;

var particles = [];

var world = {
    // https://fr.wikipedia.org/wiki/Forme_de_l%27Univers
    // plan: an infinite 2D plan
    // torus: a finite plan where moving to top brings you to bottom, and moving right brings you to left
    topology: "torus",
    size: new Vector(100, 100)
};

window.addEventListener("mousemove", function (e) {

});

var minCircleSize = 1;
var maxCircleSize = 5;



// We use a buffer to remember where the mousedown occurs, as the particules are created on mouseup event
var mouseBuffer = {
    down: new Vector(),
    up: new Vector()
};

snapMouse = function(e) {
    const bound = canvas.getBoundingClientRect();

    var coords = new Vector();
    coords.x = e.pageX - bound.left;
    coords.y = e.pageY - bound.top;

    return coords;
}

window.addEventListener("mousedown", function (e) {
    mouseBuffer.down = snapMouse(e);
});

window.addEventListener("mouseup", function (e) {
    mouseBuffer.up = snapMouse(e);

    var c = mouseBuffer.down.clone();
    // Initial speed is defined by the move with mouse down
    var v = mouseBuffer.up.sub(mouseBuffer.down);
    v = v.div(world.size.x);

    // Scale from render coordinates to world coordinates
    const bound = canvas.getBoundingClientRect();
    c.set(c.mul(new Vector(world.size.x / bound.width, world.size.y / bound.height)));
    v.set(v.mul(new Vector(world.size.x / bound.width, world.size.y / bound.height)));

    r = Math.random() * (maxCircleSize - minCircleSize) + minCircleSize;
    particles.push(new Circle(c, r, v));
});

// The shortest vector going from right to left
function distanceVector(left, right) {
    // Euclidian distance
    var d = left.c.sub(right.c);

    if (world.topology === "torus") {
        // https://blog.demofox.org/2017/10/01/calculating-the-distance-between-points-in-wrap-around-toroidal-space/

        // Consider the diff vector in the first block
        torusD = new Vector(torus(world.size.x, d.x), torus(world.size.y, d.y));

        // The following coordinate are >0 as they are in the first block
        dx = torusD.x;
        dy = torusD.y;

        // The shortest path is going is the reverse direction (width)
        if (dx > world.size.x / 2)
            dx -= world.size.x;

        // The shortest path is going is the reverse direction (height)
        if (dy > world.size.y / 2)
            dy -= world.size.y;

        var dd = new Vector(dx, dy);

        return dd;
    } else {
        // flat universe
        return d;
    }
}
function distancePreventZero(d) {
    // We add 100.0 to prevent getting too much near 0 and related instabilities as we will divide by `norm`
    var norm = Math.sqrt(100.0 + d.lengthSq());
    return norm;
}

// if torus: https://physics.stackexchange.com/questions/21882/gravitation-in-a-space-that-is-topologically-toroidal
function compute_forces() {
    // For each particule in the world
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // reset its acceleration
        p.a.set(0);

        // For each other particuule in the world (consider each pair only once)
        for (var j = 0; j < i; j++) {
            var p2 = particles[j];

            // Distance vector. It may have not-trivial directions due to universe topology
            var d = distanceVector(p, p2);

            // distance between particules
            var norm = distancePreventZero(d);
            // BEWARE We cube it as we will later multiply by the direction vector `d`
            var mag = gravity / (norm * norm * norm);

            // Each particule apply a force to each other particule
            // We `.set` as `.sub` and `.add` does not mutate current vector 
            p.a.set(p.a.sub(d.mul(mag * p2.m)));
            p2.a.set(p2.a.add(d.mul(mag * p.m)));

            
            if (world.topology == "torus") {
                // https://physics.stackexchange.com/questions/21882/gravitation-in-a-space-that-is-topologically-toroidal
                // The gravity is also applied from the copy through the torus. One may argue we could conisder only
                // the nearest copy. However, if 2 objects are separated by `size / 2` the force from the lfet copy and the right copy
                // are roughly equivalent

            }
            
        }
    }

}


function do_collisions() {
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        for (var j = 0; j < i; j++) {
            var p2 = particles[j];

            if (checkCCCol(p, p2)) {
                // This pair of particules are collisioning
                resCCCol(p, p2);
            }
        }

    }
}

// Verlet-XXX method: we compute coordinates with an timestamp
// Before updateing forces, and re-computing coordinates
function do_physics(dt) {
    for (var i1 = 0; i1 < particles.length; i1++) {
        var p1 = particles[i1];
        p1.c.set(p1.c.add(p1.v.mul(0.5 * dt)));
    }
    compute_forces();
    for (var i2 = 0; i2 < particles.length; i2++) {
        var p2 = particles[i2];
        p2.v.set(p2.v.add(p2.a.mul(dt)));
    }
    for (var i3 = 0; i3 < particles.length; i3++) {
        var p3 = particles[i3];
        p3.c.set(p3.c.add(p3.v.mul(0.5 * dt)));
    }
    do_collisions();
}

function update() {
    timeStepSplitSecond = 4;
    for (var k = 0; k < timeStepSplitSecond; k++) {
        do_physics(1.0 / timeStepSplitSecond);
    }

    render();

    RAF(update);
}

document.addEventListener('DOMContentLoaded', function () {
    update();
});

function torus(size, coordinate) {
    blocks = Math.floor(coordinate / size);

    return coordinate - blocks * size;
}

function render() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    var w = canvas.width;
    var h = canvas.height;


    ctx.clearRect(0, 0, w, h);

    const particulesToRender = [];

    cineticEnergy = 0;

    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // console.log("raw", p.c);

        if (world.topology == "torus") {
            // Given a coordinate, we represented in the main `[0,size[` block
            centeredC = new Vector(torus(world.size.x, p.c.x), torus(world.size.y, p.c.y));
        } else {
            centeredC = p.c;
        }
        // console.log("centered", centeredC);

        cineticEnergy += p.v.lengthSq() * p.m;

        centeredC.p = p;
        particulesToRender.push(centeredC);

        if (world.topology == "torus") {
            if (centeredC.x + p.r > world.size.x) {
                // Print the same object shifted on the left block: the right aisle would overlap on the first block
                centeredC = new Vector(centeredC.x - world.size.x, centeredC.y);
                centeredC.p = p;
                particulesToRender.push(centeredC);
            }
            if (centeredC.x - p.r < 0) {
                centeredC = new Vector(centeredC.x + world.size.x, centeredC.y);
                centeredC.p = p;
                particulesToRender.push(centeredC);
            }
            if (centeredC.y + p.r > world.size.y) {
                centeredC = new Vector(centeredC.x, centeredC.y - world.size.y);
                centeredC.p = p;
                particulesToRender.push(centeredC);
            }
            if (centeredC.y - p.r < 0) {
                centeredC = new Vector(centeredC.x, centeredC.y + world.size.y);
                centeredC.p = p;
                particulesToRender.push(centeredC);
            }
            // TODO Add overlaps on the diagonals/corners
        }

    }

    particulesToRender.forEach((centeredC) => {
        ctx.beginPath();

        renderC = centeredC.mul(new Vector(canvas.getBoundingClientRect().width / world.size.x, canvas.getBoundingClientRect().height / world.size.y));
        // console.log("render", renderC);

        p = centeredC.p;

        // TODO Scale `r` with world
        scaledR = p.r * canvas.getBoundingClientRect().width / world.size.x;
        ctx.arc(renderC.x, renderC.y, scaledR, 0, Math.PI * 2, false);

        ctx.fillStyle = "#000";
        ctx.strokeStyle = "green";
        ctx.fill();
        ctx.closePath();

        sInsightFactor = 30;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "blue";
        ctx.moveTo(renderC.x, renderC.y);
        ctx.lineTo(renderC.x + p.v.x * sInsightFactor, renderC.y + p.v.y * sInsightFactor);
        ctx.stroke();
        ctx.closePath();

        aInsightFactor = 100;
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        ctx.moveTo(renderC.x + p.v.x * sInsightFactor, renderC.y + p.v.y * sInsightFactor);
        ctx.lineTo(renderC.x + p.v.x * sInsightFactor + p.a.x * aInsightFactor, renderC.y + p.v.y * sInsightFactor  + p.a.y * aInsightFactor);
        ctx.stroke();
        ctx.closePath();
    });

    // console.log("total cinetic energy: ", cineticEnergy);
}