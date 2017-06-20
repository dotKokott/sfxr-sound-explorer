var $ = require("jquery");
var config = require("./config");
var p5 = require("p5");
var TWEEN = require("TWEEN");
var dat = require("dat-gui");

var Tone = require("Tone");
var Player = Tone.MultiPlayer;

var player;


var tsnes = [];
var tsne_id = 0;
var files = [];
var fileCount = 6000;
var loadedCount = 0;

var loaded = false;
var myp5;

const WIDTH = 800;
const HEIGHT = 800;

const presets = ['pickup', 'laser', 'explosion', 'powerup', 'hit', 'jump', 'blip']

const RADIUS = 2;
const LIFE_TIME = 0.5;
var points = [];
var target_points = [];
var playlist = [];

const TWEEN_TIME = 1.0;

var options = {
    perplexity: 30,
    select_radius: 10,
    tween_time: 10.0,
    alpha: 5,
    ball_radius: 2,
    auto_switch: false
}

var sketch = function( sketch ) {
    sketch.preload = function() {

    }

    sketch.getPointColor = function(path) {
        var step = 360 / presets.length;

        for(var i = 0; i < presets.length; i++) {
            var preset = presets[i];
            if(path.includes(preset)) return sketch.color(step * i, 360, 180);
        }
    }

    sketch.setupTargets = function(initPoints) {
        target_points.length = 0;
        for(var i = 0; i < files.length; i++) {
            var file = files[i].value;
            var posX = file.point[0] * WIDTH;
            var posY = file.point[1] * HEIGHT;

            var color = sketch.getPointColor(file.path);
            if(initPoints) {
                points.push( { x: WIDTH / 2, y: HEIGHT / 2, color: color });
            }

            target_points.push({ x: posX, y: posY, color: color });
        }

        sketch.tweenPositions();
    }

    sketch.setup = function() {
        var gui = new dat.GUI();
        var p = gui.add(options, 'perplexity', 1, tsnes.length).step(1).listen();
        gui.add(options, 'select_radius', 2, 20).step(1).listen();
        gui.add(options, 'tween_time', 0.2, 30).listen();
        gui.add(options, 'alpha', 1, 255).step(1);
        gui.add(options, 'ball_radius', 2, 20).step(1);
        gui.add(options, 'auto_switch');

        p.onChange(function(value) {
            tsne_id = value - 1;
            files = tsnes[tsne_id];
            sketch.setupTargets(false);
        })
        files = tsnes[0];
        sketch.colorMode(sketch.HSL, 360);
        var cnv = sketch.createCanvas(WIDTH, HEIGHT);
        sketch.background(0);

        sketch.setupTargets(true);
        tsne_id = options.perplexity - 1;
        sketch.next();

        sketch.frameRate(30);
    }

    sketch.next = function() {
        if(options.auto_switch) {
            tsne_id++;
            if(tsne_id >= tsnes.length -1) tsne_id = 0;
            tsne_id = Math.min(Math.max(tsne_id, 0), tsnes.length -1);
            options.perplexity = tsne_id + 1;
            files = tsnes[tsne_id];
            sketch.setupTargets(false);
        }

        setTimeout(sketch.next, options.tween_time * 1000);
    }

    sketch.tweenPositions = function() {
        for(var i = 0; i < points.length; i++) {
            var p = points[i];
            var t = target_points[i];

            var tween = new TWEEN.Tween(p);
            tween.to({ x: t.x, y: t.y}, options.tween_time * 1000).start();
            //.easing( TWEEN.Easing.Cubic.InOut )
        }
    }

    sketch.keyPressed = function() {
        if (sketch.keyCode === sketch.LEFT_ARROW) {
          tsne_id--;
        } else if (sketch.keyCode === sketch.RIGHT_ARROW) {
          tsne_id++;
        }

        if(sketch.keyCode === sketch.LEFT_ARROW || sketch.keyCode === sketch.RIGHT_ARROW) {
            tsne_id = Math.min(Math.max(tsne_id, 0), tsnes.length -1);
            options.perplexity = tsne_id + 1;
            files = tsnes[tsne_id];
            sketch.setupTargets(false);
        }
    }

    sketch.mouseMoved = function() {
        for(var i = 0; i < points.length; i++) {
            if(files[i].lifetime > 0) continue;
            var p = points[i];
            var d = sketch.dist(sketch.mouseX, sketch.mouseY, p.x, p.y);
            if (d < options.select_radius) {
                player.start(i);
                files[i].lifetime = LIFE_TIME;
            }
        }

        return false;
    }

    sketch.draw = function() {
        sketch.background(0, 0, 0, options.alpha);

        TWEEN.update();

        for(var i = 0; i < points.length; i++) {
            files[i].lifetime -= 1 / 60.0;

            var point = points[i];
            var color = point.color;

            if(files[i].lifetime <= 0) {
                sketch.ellipse(point.x, point.y, options.ball_radius * 2, options.ball_radius * 2);
            } else {
                sketch.ellipse(point.x, point.y, options.ball_radius * 4, options.ball_radius * 4);
            }

            sketch.stroke(color);
            sketch.fill(color);
        }
    }
}

function loadAudioData(id, path, callback) {
    player.fadeIn = 0.001;
    player.fadeOut = this.soundReleaseTime;
    player.add(id, path, callback);
}

function audioFileLoaded(response) {
    loadedCount++;

    if(loadedCount == fileCount) {
        loaded = true;
        myP5 = new p5(sketch, 'sketch-div');
    }
}

var firstOne = true;
function init() {
    player = new Player().toMaster();

    $.ajax({
        //This will retrieve the contents of the folder if the folder is configured as 'browsable'
        url: 'tsne',
        success: function (data) {
            //List all .png file names in the page
            $(data).find(".name").each(function(id) {
                var filename = $(this).text();

                $.getJSON(config.paths.tsne + filename, function(data) {
                    var _files = [];
                    tsnes.push(_files);
                    fileCount = data.length;
                    $.each( data, function( key, val ) {
                      _files.push({id: key, value: val, lifetime: 0});
                      if(firstOne) {
                        loadAudioData(key, config.paths.audio + '/' + val.path, audioFileLoaded);
                      }
                    });

                    if(firstOne) {
                        firstOne = false;
                        files = tsnes[0];
                    }
                })
            })
        }
    });
}

$( document ).ready(function() {
    init();
});
