doRender = function (ctx, canvaWidth, canvaHeight, world) {
    ctx.reset();


    ctx.fillStyle = "green";
    ctx.lineWidth = 3;
    ctx.arc(canvaWidth / 2, canvaHeight / 2, Math.min(canvaWidth / 8, canvaHeight / 8), 0, 2 * Math.PI);
    ctx.fill();
    
    // Stroke out circle
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.lineWidth = 3;
    ctx.arc(canvaWidth / 2, canvaHeight / 2, Math.min(canvaWidth / 2, canvaHeight / 2), 0, 2 * Math.PI);
    ctx.stroke();


    const game = world.game;

    if (world.players) {
        for (let particule of particules) {
            console.log(particule);

            canvaX = particule.position.x * canvaWidth / game.width;
            canvaY = particule.position.y * canvaHeight / game.height;

            const playerSemiWidth = 5;
            const playerSemiHeight = playerSemiWidth;

            ctx.lineWidth = 3;
            ctx.strokeStyle = "blue";
            ctx.moveTo(canvaX, canvaY);
            ctx.lineTo(canvaX + particule.speed.x * 10, canvaY + particule.speed.y * 10);
            ctx.stroke();

            ctx.lineWidth = 1;
            // ctx.fillStyle = "red";
            ctx.strokeStyle = "red";
            ctx.strokeRect(canvaX - playerSemiWidth, canvaY - playerSemiHeight, 2 * playerSemiWidth, 2 * playerSemiHeight);
        }
    }
}

updatePhysics = function(world, timestep) {
    // https://gamedev.stackexchange.com/questions/15708/how-can-i-implement-gravity
    if (json.particules) {
        for (let particule of particules) {
            value.position.x += value.speed.x;
            value.position.y += value.speed.y;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById("can");
    var ctx = canvas.getContext("2d");
    const canvaWidth = 300;
    const canvaHeight = 200;

    doRender(ctx, canvaWidth, canvaHeight, {})

    fetch("position0.json")
        .then(response => response.json())
        .then(json => {
            console.log(json);

            timestamp = Date.now();

            (function move() {
                newTimestamp = Date.now();
                updatePhysics(json, newTimestamp-timestamp)
                timestamp = newTimestamp

                doRender(ctx, canvaWidth, canvaHeight, json)

                setTimeout(move, 50);
            })();
        });
});