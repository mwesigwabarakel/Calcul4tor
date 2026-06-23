
/* Pure arithmetic functions (exported for tests) */
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
/* exported divide returns JS behavior (Infinity on divide by zero) for tests */
const divide = (a, b) => a / b;

/* Export for Node/Jest */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { add, subtract, multiply, divide };
}

/* UI code */
document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.button');

    let current = '0';
    let previous = null;
    let operator = null;
    let waitingForSecond = false;

    const setDisplay = (v) => {
        display.value = v;
    };

    const formatNumber = (n) => {
        if (!Number.isFinite(n)) return 'Error';
        return parseFloat(n.toFixed(12)).toString();
    };

    const resetAll = () => {
        current = '0';
        previous = null;
        operator = null;
        waitingForSecond = false;
        setDisplay(current);
    };

    const inputDigit = (digit) => {
        if (waitingForSecond) {
            current = digit;
            waitingForSecond = false;
        } else {
            current = current === '0' ? digit : current + digit;
        }
        setDisplay(current);
    };

    const inputDecimal = () => {
        if (waitingForSecond) {
            current = '0.';
            waitingForSecond = false;
            setDisplay(current);
            return;
        }
        if (!current.includes('.')) {
            current += '.';
            setDisplay(current);
        }
    };

    /* UI compute: treat division-by-zero as 'Error' for display */
    const compute = (a, b, op) => {
        switch (op) {
            case '+': return add(a, b);
            case '-': return subtract(a, b);
            case '*': return multiply(a, b);
            case '/': return b === 0 ? 'Error' : divide(a, b);
            default: return b;
        }
    };

    const handleOperator = (nextOp) => {
        const inputValue = parseFloat(current);
        if (operator && !waitingForSecond) {
            const result = compute(previous, inputValue, operator);
            if (result === 'Error' || !Number.isFinite(result)) {
                setDisplay('Error');
                previous = null;
                operator = null;
                waitingForSecond = false;
                current = '0';
                return;
            }
            previous = result;
            current = formatNumber(result);
            setDisplay(current);
        } else if (!isNaN(inputValue)) {
            previous = inputValue;
        }
        operator = nextOp;
        waitingForSecond = true;
    };

    const handleEquals = () => {
        const inputValue = parseFloat(current);
        if (operator && previous !== null && !isNaN(inputValue)) {
            const result = compute(previous, inputValue, operator);
            if (result === 'Error' || !Number.isFinite(result)) {
                setDisplay('Error');
                current = '0';
            } else {
                current = formatNumber(result);
                setDisplay(current);
            }
            previous = null;
            operator = null;
            waitingForSecond = false;
        }
    };

    const handleBackspace = () => {
        if (waitingForSecond) return;
        if (current.length > 1) current = current.slice(0, -1);
        else current = '0';
        setDisplay(current);
    };

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const v = btn.innerText.trim();
            if (/^[0-9]$/.test(v)) inputDigit(v);
            else if (v === '.') inputDecimal();
            else if (v === 'C') resetAll();
            else if (v === '=') handleEquals();
            else if (/^[+\-*/]$/.test(v)) handleOperator(v);
        });
    });

    window.addEventListener('keydown', (e) => {
        if (/^[0-9]$/.test(e.key)) inputDigit(e.key);
        else if (e.key === '.') inputDecimal();
        else if (['+', '-', '*', '/'].includes(e.key)) {
            handleOperator(e.key);
            e.preventDefault();
        } else if (e.key === 'Enter' || e.key === '=') {
            handleEquals();
            e.preventDefault();
        } else if (e.key === 'Escape') {
            resetAll();
        } else if (e.key === 'Backspace') {
            handleBackspace();
        }
    });

    resetAll();
});
