import Phaser from 'phaser';

let canvas_w = 800;
let canvas_h = 450;

let field_center = canvas_w / 2 + canvas_w / 8;
let canvas_bg, eggcups_bg;
let huevera_b, huevera_m, huevera_d;
let huevera_x = 128;
let huevo_shadow;
let sprite_scale = 0.6;

let countdown = 20;
let countdown_text;
let countdown_interval;

let huevos = [];
let huevos_speed = 1;
let huevos_interval;
let huevos_interval_time = 3000;
let huevo_current = 0;


let music = { background: null, game_over: null };
let fx = { mouseclick: null };


let score = 0;
let score_text;

export function precarga() {

    this.load.image('grass_bg', 'assets/imgs/grass_bg.png');
    this.load.image('straw_bg', 'assets/imgs/straw_bg.png');
    this.load.image('huevera', 'assets/imgs/huevera.png');
    this.load.image('huevo', 'assets/imgs/huevo.png');

    this.load.audio('background_music', 'assets/audio/apple_cider.mp3');
    this.load.audio('game_over_music', 'assets/audio/GameOver.mp3');
    this.load.audio('mouseclick_fx', 'assets/audio/mouseclick.mp3');
}

export function crea() {

    const scene = this;

   
    let blanco = Phaser.Display.Color.GetColor(255, 255, 255);
    let marron = Phaser.Display.Color.GetColor(192, 128, 16);
    let dorado = Phaser.Display.Color.GetColor(255, 215, 0);


    canvas_bg = scene.add.image(canvas_w / 2, canvas_h / 2, 'grass_bg');


    eggcups_bg = scene.add.image(huevera_x, canvas_h / 2, 'straw_bg');
    eggcups_bg.setScale(0.5);
    eggcups_bg.angle = 90;

    huevera_d = scene.add.image(huevera_x, canvas_h / 2 - 128, 'huevera');
    huevera_d.setScale(sprite_scale);
    huevera_d.setTint(dorado);
    huevera_d.huevera_type = 'd';

    huevera_m = scene.add.image(huevera_x, canvas_h / 2, 'huevera');
    huevera_m.setScale(sprite_scale);
    huevera_m.setTint(marron);
    huevera_m.huevera_type = 'm';

    huevera_b = scene.add.image(huevera_x, canvas_h / 2 + 128, 'huevera');
    huevera_b.setScale(sprite_scale);
    huevera_b.huevera_type = 'b';

    huevo_shadow = scene.add.image(-10000, -10000, 'huevo');
    huevo_shadow.setTint('#000000');
    huevo_shadow.alpha = 0.5;
    huevo_shadow.setScale(1.3);

    let huevos_max = 30; 
    let offset_x_min = field_center - 224;
    let offset_x_max = field_center + 224;

    for (let i = 0; i < huevos_max; i++) {
        let x = Phaser.Math.Between(offset_x_min, offset_x_max);
        let y = -64;

        let huevo_tmp = scene.add.image(x, y, 'huevo');
        huevo_tmp.falling = (i === 0); 

        let random_num = Phaser.Math.Between(1, 100);
        let color = blanco;
        let huevo_type = 'b';

        if (random_num % 4 === 0) {
            color = marron;
            huevo_type = 'm';
        } else if (random_num % 9 === 0) {
            color = dorado;
            huevo_type = 'd';
        }

        huevo_tmp.setTint(color);
        huevo_tmp.huevo_type = huevo_type;

        huevo_tmp.setInteractive({ draggable: true });
        huevo_tmp.on('pointerdown', function () {
            this.falling = false;
            huevo_shadow.x = this.x + 8;
            huevo_shadow.y = this.y + 8;
            fx.mouseclick.play();
            this.setScale(1.3);
        });

        huevos.push(huevo_tmp);
    }

    scene.input.on('drag', (pointer, object, x, y) => {
        object.x = x;
        object.y = y;
        huevo_shadow.x = x + 8;
        huevo_shadow.y = y + 8;
    });

    scene.input.on('dragend', (pointer, object) => {
        object.setScale(1);
        huevo_shadow.x = -10000;
        huevo_shadow.y = -10000;

        if (Phaser.Geom.Intersects.RectangleToRectangle(huevera_b.getBounds(), object.getBounds())) {
            if (object.huevo_type === 'b') {
                countdown += 5;
                score += 10;
            } else {
                countdown -= 5;
                score -= 5;
            }
            object.destroy();
        } else if (Phaser.Geom.Intersects.RectangleToRectangle(huevera_m.getBounds(), object.getBounds())) {
            if (object.huevo_type === 'm') {
                countdown += 5;
                score += 20;
            } else {
                countdown -= 5;
                score -= 5;
            }
            object.destroy();
        } else if (Phaser.Geom.Intersects.RectangleToRectangle(huevera_d.getBounds(), object.getBounds())) {
            if (object.huevo_type === 'd') {
                countdown += 5;
                score += 30;
            } else {
                countdown -= 5;
                score -= 5;
            }
            object.destroy();
        } else {
            let penalty = 0;
            if (object.huevo_type === 'b') {
                penalty = 5;
            } else if (object.huevo_type === 'm') {
                penalty = 10;
            } else if (object.huevo_type === 'd') {
                penalty = 15;
            }
            object.destroy();
            score -= penalty;
        }

        score = Math.max(0, score);
        countdown_text.text = countdown;
        score_text.text = 'Puntos: ' + score;
    });

    countdown_text = scene.add.text(field_center, 16, countdown, {
        fontSize: '48px',
        fontStyle: 'bold'
    });
    score_text = scene.add.text(field_center, 80, 'Puntos: ' + score, {
        fontSize: '32px',
        fontStyle: 'bold'
    });

    music.background = scene.sound.add('background_music', { loop: true, volume: 0.5 });
    music.background.play();
    music.game_over = scene.sound.add('game_over_music');
    fx.mouseclick = scene.sound.add('mouseclick_fx');

    countdown_interval = setInterval(() => {
        countdown--;
        countdown_text.text = countdown;
        if (countdown <= 0) {
            gameOver();
        }
    }, 1000);


    const next_huevo = () => {
        huevo_current++;
        if (huevo_current >= huevos.length) {
            console.log('Se acabaron los huevos. Esperamos 3 segundos antes de Game Over...');
            setTimeout(() => {
                gameOver();
            }, 3000);
            return;
        }
        huevos[huevo_current].falling = true;
        huevos_interval_time -= 100;
        if (huevos_interval_time < 400) {
            huevos_interval_time = 400;
        }
        huevos_interval = setTimeout(next_huevo, huevos_interval_time);
    };

    const gameOver = () => {
        console.log('Game Over');
        music.background.stop();
        music.game_over.play();
        clearInterval(countdown_interval);
        clearTimeout(huevos_interval);

        scene.input.enabled = false;


        scene.add.text(canvas_w / 2, canvas_h / 2, 'GAME OVER\nPuntuación: ' + score, {
            fontSize: '48px',
            color: '#FFFFFF',
            backgroundColor: '#000000',
            align: 'center'
        }).setOrigin(0.5);
    };


    huevos_interval = setTimeout(next_huevo, huevos_interval_time);
}

export function actualiza() {
    if (countdown === 10) {
        music.background.rate = 1.25;
    }


    for (let i = 0; i < huevos.length; i++) {
        if (huevos[i].falling) {
            huevos[i].y += huevos_speed;

            if (huevos[i].y > canvas_h + 64) {
                if (!huevos[i].processed) {
                    let penalty = 0;
                    if (huevos[i].huevo_type === 'b') {
                        penalty = 3;
                    } else if (huevos[i].huevo_type === 'm') {
                        penalty = 6;
                    } else if (huevos[i].huevo_type === 'd') {
                        penalty = 9;
                    }
                    score -= penalty;
                    score = Math.max(0, score);
                    score_text.text = 'Puntos: ' + score;
                    huevos[i].processed = true;
                    huevos[i].destroy();
                }
                huevos[i].falling = false;
            }
        }
    }
}
