function format(form, isPad = false) {
    return form.replace(/yyyy|MM|dd|HH|mm|ss|SSS|AP/g, ($1) => {
        const times = new Date(this);

        switch ($1) {
            case 'yyyy':
                return times
                    .getFullYear()
                    .toString()
                    .padStart(isPad ? 2 : 0, 0);
            case 'MM':
                return times
                    .getMonth()
                    .toString()
                    .padStart(isPad ? 2 : 0, 0);
            case 'dd':
                return times
                    .getDay()
                    .toString()
                    .padStart(isPad ? 2 : 0, 0);
            case 'HH':
                return times
                    .getHours()
                    .toString()
                    .padStart(isPad ? 2 : 0, 0);
            case 'mm':
                return times
                    .getMinutes()
                    .toString()
                    .padStart(isPad ? 2 : 0, 0);
            case 'ss':
                return times
                    .getSeconds()
                    .toString()
                    .padStart(isPad ? 2 : 0, 0);
            case 'SSS':
                return times.getMilliseconds();
            case 'AP':
                return times.getHours() > 12 ? 'PM' : 'AM';
        }

        return $1;
    });
}
Date.prototype.format = format;
Number.prototype.format = format;
Array.last = function (array) {
    if (array.length === 0) return array;
    return array[array.length - 1];
};

function classnames() {
    let temp = [];

    [...arguments].forEach((item) => {
        if (typeof item === 'object') {
            const key = Object.keys(item).pop();
            if (item[key]) temp.push(key);
        } else {
            if (item) temp.push(item);
        }
    });

    return temp.join(' ');
}

function PipeLine() {
    Array.call(this);
}

PipeLine.prototype = Array.prototype;
PipeLine.prototype.pipelines = [];
PipeLine.prototype.addPipe = function (func, ...args) {
    let base = this instanceof PipeLine ? undefined : this;
    PipeLine.prototype.pipelines.push(func.bind(base, ...args));
};
PipeLine.prototype.excute = function () {
    try {
        PipeLine.prototype.pipelines.forEach((pipe) => pipe());
    } catch (e) {
        throw new Error('error');
    } finally {
        PipeLine.prototype.clearPipeLines();
    }
};

PipeLine.prototype.clearPipeLines = function () {
    let i;
    for(i=0; i<this.pipelines.length; i++) {
        delete this.pipelines[i];
    }
}

function getEl(name) {
    return document.querySelector(name);
}

export { classnames, getEl, PipeLine };
