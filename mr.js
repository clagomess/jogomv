//------- Preload
var arImg = [
        'sprite/img_00.jpg',
        'sprite/img_01.jpg',
        'sprite/img_02.png',
        'sprite/img_03.png',
        'sprite/img_04.png',
        'sprite/img_05.png',
        'sprite/img_07.png',
        'sprite/img_08.png',
        'sprite/img_10.png',
        'sprite/img_11.png'
];

$(arImg).each(function () {
    $('<img />').attr('src', this).appendTo('body').css('display', 'none');
});

var arAudio = [
    'sound/sd_01.ogg',
    'sound/sd_02.ogg',
    'sound/sd_03.ogg',
    'sound/sd_04.ogg',
    'sound/sd_05.ogg',
];

$(arAudio).each(function () {
    var preAudio = new Audio(this);
});
//------- End Preload

$(window).load(function () {
    $('#load').remove();
});

function mr_fechar_boasvindas() {
    $('#boas-vindas').hide();
    $('#char-select').show();

    $('#char-list li').click(function () {
        $('#char-list li').removeAttr('curr');
        $(this).attr('curr', '1');
        $('#char-select .bt').show();
    });
}

var mr_pontos = null;
var mr_life = null;
var mr_char_sound = null;
var lvl_policia = null;

var mr_bg_sound = new Audio("sound/sd_03.ogg");
mr_bg_sound.loop = true;
mr_bg_sound.volume = 0.08;


function start() {
    mr_pontos = 0;
    mr_life = 400;
    mr_char_sound = null;
    lvl_policia = 10;

    $('#char-select').hide();
    $('#gameover').hide();

    mr_char();

    for (i = 0; i < lvl_policia; i++) {
        mr_policia();
    }

    lvl_policia += 10;

    mr_bg_sound.play();
    mr_refresh();
}

function mr_refresh() {
    $('#lifebar .progress').css('width', parseInt((mr_life * 100) / 400) + '%');
    $('#score .pts').text(mr_pontos);

    if (mr_life <= 0) {
        $('.char_policia, #comuna').stop(true, false);
        $('.char_policia, #comuna').remove();
        mr_bg_sound.pause();
        $('#gameover .ptx').text(mr_pontos);
        $('#gameover').show();
    }

    if (mr_life > 0) {
        if ($('.char_policia').length <= 2) {
            for (i = 0; i < lvl_policia; i++) {
                mr_policia();
            }

            lvl_policia += 10;
        }
    }
}

function mr_char() {
    var html = "";
    var char = $('#char-select li[curr]').attr('char');
    $('#charname').text($('#char-select li[curr]').text());

    html += "<div id=\"comuna\" class=\"char_comuna " + char + "\">";
    html += "<div class=\"sprite\"></div>";
    html += "<div class=\"cartaz\" style=\"display:none\"></div>";
    html += "</div>";

    $('#mr').append(html);

    mr_char_ready();

    if (char == 'char_bedbloc') {
        mr_char_sound = new Audio("sound/sd_01.ogg");
    } else {
        mr_char_sound = new Audio("sound/sd_02.ogg");
    }
}

function mr_char_ready() {
    function loop() {
        $('#comuna').animate({
            top: '-=10'
        }, 'fast', 'linear', function () {
            $('#comuna').animate({
                top: '+=10'
            }, 'fast', 'linear', function () {
                loop();
                if (mr_life < 400) {
                    if ($('#comuna .cartaz').attr('defesa')) {
                        mr_life += 10;
                    }

                    mr_refresh();
                }

                $('[skill]').each(function () {
                    var progress = parseInt($(this).attr('progress'));

                    if (progress < 100) {
                        switch ($(this).attr('skill')) {
                            case 'pedra':
                                progress += 50;
                                break;
                            case 'rojao':
                                progress += 10;
                                break;
                        }

                        $(this).attr('progress', progress);
                        $(this).find('.progress').css('width', progress + '%');
                    }
                });
            });
        });
    }

    loop();
}

function mr_char_ataque(tipo) {
    mr_refresh();

    var maisperto = parseInt($('.char_policia:eq(0)').css('right'));
    var policia = $('.char_policia:eq(0)');

    $('.char_policia').each(function () {
        if (parseInt($(this).css('right')) > maisperto) {
            maisperto = parseInt($(this).css('right'));
            policia = $(this);
        }
    });

    if (maisperto > 130) {
        var policia_life = parseInt($(policia).attr('life'));
        var dano = 0;
        switch (tipo) {
            case 'q':
                if ($('#comuna .cartaz').attr('defesa')) {
                    dano = 2;
                } else {
                    dano = 10;
                }
                mr_projetil('q', maisperto);
                break;
            case 'w':
                if (parseInt($('[skill="pedra"]').attr('progress')) >= 100) {
                    dano = 30;
                    $('[skill="pedra"]').attr('progress', 0);
                    $('[skill="pedra"]').find('.progress').css('width', '0%');
                    mr_projetil('w', maisperto);
                } else {
                    dano = 0;
                }
                break;
        }

        var pode_rojao = false;
        if (tipo == 'e') {
            if (parseInt($('[skill="rojao"]').attr('progress')) >= 100) {
                dano = 100;
                $('[skill="rojao"]').attr('progress', 0);
                $('[skill="rojao"]').find('.progress').css('width', '0%');
                pode_rojao = true;
            } else {
                dano = 0;
            }
        }

        policia_life -= dano;

        $(policia).attr('life', policia_life);
        $(policia).find('.progress').css('width', policia_life + '%');

        //rojão
        if (tipo == 'e' && pode_rojao) {
            mr_projetil(tipo, (maisperto > 150 ? maisperto : 150));

            $('.char_policia').each(function () {
                if ($('#comuna .cartaz').attr('defesa')) {
                    dano = 10;
                } else {
                    dano = 50;
                }

                policia_life = parseInt($(this).attr('life')) - dano;

                $(this).attr('life', policia_life);
                $(this).find('.progress').css('width', policia_life + '%');
            });
        }

        $('.char_policia').each(function () {
            if (parseInt($(this).attr('life')) <= 0) {
                $(this).stop(true, false);
                var policia = $(this);
                $(policia).remove();

                mr_pontos += 15;
            }
        });
    } else {
        mr_projetil(tipo, null);
    }

    mr_refresh();
}

var mr_rojao_sound = new Audio("sound/sd_05.ogg");
var mr_ataque_sound = new Audio("sound/sd_04.ogg");

function mr_projetil(tipo, destino) {
    var html = '';
    var idx = parseInt(Math.random() * 1000000);

    html += '<div id="' + idx + '" class="projetil '
    switch (tipo) {
        case 'q':
            html += 'projetil_pau';
            break;
        case 'w':
            html += 'projetil_pedra';
            break;
        case 'e':
            html += 'projetil_rojao';
            break;
    }
    html += '" style="right:460px;"></div>';

    $('#mr').append(html);

    var has_sound = (destino ? true : false);

    $('#' + idx).animate({
        right: (destino ? destino : 150)
    }, {
        duration: 500,
        step: function (x, fx) {
            $(this).css('top', (0.0021 * Math.pow(x, 2) - 1.5205 * x) + 349.8929);
        },
        complete: function () {
            $('#' + idx).remove();
            if (has_sound) {
                if (tipo == 'e') {
                    mr_rojao_sound.pause();
                    mr_rojao_sound.currentTime = 0;
                    mr_rojao_sound.play();
                } else {
                    mr_ataque_sound.pause();
                    mr_ataque_sound.currentTime = 0;
                    mr_ataque_sound.play();
                }
            }
        }
    });
}

function mr_policia() {
    var html = "";
    var idx = parseInt(Math.random() * 1000000);

    html += "<div id=\"" + idx + "\" class=\"char_policia\" life=\"100\">";
    html += "<div class=\"lifebar\"><div class=\"progress\"></div></div>";
    html += "<div class=\"sprite\"></div>";
    html += "<div class=\"spray\" style=\"display:none\"></div>";
    html += "</div>";

    $('#mr').append(html);
    $('#' + idx).css('right', 10);
    $('#' + idx + ' .progress').css('width', '100%');

    function loop() {
        var random = parseInt(Math.random() * 200);

        $('#' + idx).animate({
            right: random
        }, 1000, 'linear', function () {
            var atualpox = parseInt($('#' + idx).css('right'));
            if (atualpox >= 300 || atualpox < 10) {
                $('#' + idx).animate({
                    right: 10
                }, 2000, 'linear');
            }

            if (atualpox >= 180) {
                $('#' + idx + ' .spray').fadeIn('fast', function () {
                    if ($('#comuna .cartaz').attr('defesa')) {
                        mr_life -= 1;
                    } else {
                        mr_life -= 30;
                        mr_char_sound.pause();
                        mr_char_sound.currentTime = 0;
                        mr_char_sound.play();
                    }

                    mr_refresh();
                });

                $('#' + idx + ' .spray').fadeOut('fast');
            }

            loop();
        });
    }

    loop();
}

// ACOES
$(window).keypress(function (e) {
    switch (e.keyCode) {
        case 32:
            $('#comuna .cartaz').show();
            $('#comuna .cartaz').attr('defesa', 1);
            return false;
            break;
        case 113:
            mr_char_ataque('q');
            break;
        case 119:
            mr_char_ataque('w');
            break;
        case 101:
            mr_char_ataque('e');
            break;
    }
});

$(window).keyup(function (e) {
    switch (e.keyCode) {
        case 32:
            $('#comuna .cartaz').hide();
            $('#comuna .cartaz').removeAttr('defesa', 1);
            return false;
            break;
    }
});