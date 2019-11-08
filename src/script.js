window.dataLayer = window.dataLayer || [];

const selectWithProbability = function (values, getIndex) {
    var total = values.reduce(function (a, b) {
        if (!("probability" in b)) {
            throw new Error("[SPORTS][RANDOM-SELECTOR] Error: There is no probability set for value: " + b.value.toString());
        }
        return a + b.probability;
    }, 0);

    if (total === 0) {
        throw new Error("[SPORTS][RANDOM-SELECTOR] Error: Total sum of probabilities must be greater than 0");
    }

    var randomValue = Math.random() * total;

    var result,
        index;

    values.some(function (value, i) {
        total -= value.probability;
        if (total < randomValue) {
            result = value;
            index = i;
            return true;
        }
    });

    if (getIndex) {
        return index;
    }

    return result;
};

const game = {
    state: 'start',
    curVariant: window.variants[0],
    turnTheReel() {
        this.state = 'reel';
        let loop = () => {
            if (this.state === 'reel' &&
                this.offsetY > this.canvas.height * 0.5) {
                this.offsetY = -this.canvas.height * 0.5;
                this.curVariant = selectWithProbability(window.variants);
                this.updateTitle(this.curVariant.title);
            } else if (this.state !== 'reel' && this.offsetY > 0) {
                this.offsetY = Math.max(this.offsetY - 5, 0);
                this.updateTitle(this.curVariant.title);
            } else if (this.state !== 'reel' && this.offsetY < 0) {
                this.offsetY = Math.min(this.offsetY + 5, 0);
                this.updateTitle(this.curVariant.title);
            } else {
                this.offsetY += 20;
                this.updateTitle(this.curVariant.title);
            }
            if (this.state === 'reel' || this.offsetY !== 0) {
                window.requestAnimationFrame(loop);
            }
        }
        window.requestAnimationFrame(loop);
    },
    updateTitle(newTitle) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#fff";
        this.ctx.font = this.font;
        this.ctx.textBaseline = 'bottom';
        this.ctx.textAlign = 'center';
        this.ctx.save();
        this.ctx.translate(0, this.offsetY);
        this.ctx.fillText(newTitle.toUpperCase(), this.textOffset[0], this.textOffset[1])
        const samplesCount = 2;
        if (this.state === 'reel') {
            for (var i = 0; i < samplesCount; i++) {
                this.ctx.globalAlpha = 1 / (i * 1.3);
                this.ctx.fillText(newTitle.toUpperCase(), this.textOffset[0], this.textOffset[1] - this.textOffset[1] * 0.25 * i);
            }
            this.ctx.globalAlpha = 1;
        }
        this.ctx.restore();
        this.ctx.filter = "none";
    },
    title: 'Какой Клопп твой? Игра Sports.ru',
    offsetY: 0,
    initCanvas() {
        this.canvas.width = this.resultWrapperEl.clientWidth * 2;
        this.canvas.height = this.resultWrapperEl.clientHeight * 2;
        this.canvas.style.width = this.resultWrapperEl.clientWidth + 'px';
        this.canvas.style.height = this.resultWrapperEl.clientHeight + 'px';
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(2, 2);
        this.ctx.fillStyle = "#fff";
        if (this.resultWrapperEl.clientWidth < 380) {
            this.font = "bold 28px Roboto";
            this.textOffset = [this.canvas.width / 4, this.canvas.height * 0.4];
        } else {
            this.font = "bold 38px Roboto";
            this.textOffset = [this.canvas.width / 4, this.canvas.height * 0.45];
        }
        this.updateTitle(this.curVariant.title);
    },
    font: "bold 38px Roboto",
    init() {
        let wrapper = document.getElementById('klopp-wrapper');
        this.resultEl = wrapper.querySelector('.klopp-js-result');
        this.btnEl = wrapper.querySelector('.klopp-js-trigger');
        this.stopEl = wrapper.querySelector('.klopp-js-stop');
        this.moreEl = wrapper.querySelector('.klopp-js-more');
        this.resultWrapperEl = wrapper.querySelector('.klopp-result');
        this.canvas = wrapper.querySelector('#klopp-canvas');
        window.onresize = () => {
            this.initCanvas();
        };
        this.initCanvas();
        this.updateTitle(window.variants[0].title);
        window.dataLayer.push({
            event: "klopp",
            eventName: "action",
            eventLabel: "init"
        });
        setTimeout(() => {
            this.turnTheReel();
            this.canvas.classList.add('klopp-has-blur');
        }, 400);
        this.btnEl.addEventListener('click', () => {
            if (this.state === 'start') {
                this.moreEl.classList.add('klopp-is-hidden');
                this.stopEl.classList.remove('klopp-is-hidden');
                this.canvas.classList.add('klopp-has-blur');
                this.turnTheReel();
                window.dataLayer.push({
                    event: "klopp",
                    eventName: "action",
                    eventLabel: "more"
                });
                return;
            }
            if (this.state === 'reel') {
                this.state = 'start';
                this.canvas.classList.remove('klopp-has-blur');
                this.stopEl.classList.add('klopp-is-hidden');
                this.moreEl.classList.remove('klopp-is-hidden');

                window.dataLayer.push({
                    event: "klopp",
                    eventName: "action",
                    eventLabel: "stop"
                });
                return;
            }
        });
    }
};

game.init();
