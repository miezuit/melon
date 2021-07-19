
/* Game */
var game = {

    // an object where to store game information
    data: {
        score: 0
    },


    // Run on page load.
    "onload": function () {
        // Initializeaza canvas-ul.
        if (!me.video.init(640, 480, {
            wrapper: "screen", scale: "auto", scaleMethod: "flex"
        })) {
            alert("Your browser does not support HTML5 canvas.")
        }
    },

        // Run on game resources loaded.
        "loaded" : function () {

        }
    };
