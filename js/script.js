const currentDisplay = document.getElementById("current-display");
const previousDisplay = document.getElementById("previous-display");
const historyList = document.getElementById("history-list");
const clearHistoryButton = document.getElementById("clear-history");

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForOperand = false;
let history = [];

function updateDisplay() {
    currentDisplay.textContent = currentValue;

    if (previousValue !== null && operator !== null) {
        previousDisplay.textContent = `${previousValue} ${displayOperator(operator)}`;
    } else {
        previousDisplay.textContent = "";
    }
}

function displayOperator(value) {
    const operators = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return operators[value] || value;
}

function inputNumber(number) {
    if (currentValue === "Error") {
        clearCalculator();
    }

    if (waitingForOperand) {
        currentValue = number;
        waitingForOperand = false;
    } else if (currentValue === "0") {
        currentValue = number;
    } else {
        currentValue += number;
    }

    updateDisplay();
}

function inputDecimal() {
    if (currentValue === "Error") {
        clearCalculator();
    }

    if (waitingForOperand) {
        currentValue = "0.";
        waitingForOperand = false;
    } else if (!currentValue.includes(".")) {
        currentValue += ".";
    }

    updateDisplay();
}

function chooseOperator(nextOperator) {
    if (currentValue === "Error") return;

    const inputValue = Number(currentValue);

    if (operator && waitingForOperand) {
        operator = nextOperator;
        updateDisplay();
        return;
    }

    if (previousValue === null) {
        previousValue = inputValue;
    } else if (operator) {
        const result = calculate(previousValue, inputValue, operator);

        if (result === null) {
            showError();
            return;
        }

        previousValue = result;
        currentValue = formatNumber(result);
    }

    operator = nextOperator;
    waitingForOperand = true;
    updateDisplay();
}

function calculate(first, second, selectedOperator) {
    switch (selectedOperator) {
        case "+":
            return first + second;
        case "-":
            return first - second;
        case "*":
            return first * second;
        case "/":
            return second === 0 ? null : first / second;
        default:
            return second;
    }
}

function equals() {
    if (operator === null || previousValue === null || currentValue === "Error") {
        return;
    }

    const first = previousValue;
    const second = Number(currentValue);
    const selectedOperator = operator;
    const result = calculate(first, second, selectedOperator);

    if (result === null) {
        addHistory(`${formatNumber(first)} ${displayOperator(selectedOperator)} ${formatNumber(second)}`, "Error");
        showError();
        return;
    }

    const expression = `${formatNumber(first)} ${displayOperator(selectedOperator)} ${formatNumber(second)}`;
    const formattedResult = formatNumber(result);

    addHistory(expression, formattedResult);

    currentValue = formattedResult;
    previousValue = null;
    operator = null;
    waitingForOperand = true;

    previousDisplay.textContent = expression;
    currentDisplay.textContent = formattedResult;
}

function clearCalculator() {
    currentValue = "0";
    previousValue = null;
    operator = null;
    waitingForOperand = false;
    updateDisplay();
}

function backspace() {
    if (waitingForOperand || currentValue === "Error") return;

    currentValue = currentValue.length > 1
        ? currentValue.slice(0, -1)
        : "0";

    if (currentValue === "-") {
        currentValue = "0";
    }

    updateDisplay();
}

function percent() {
    if (currentValue === "Error") return;

    const value = Number(currentValue) / 100;
    currentValue = formatNumber(value);
    updateDisplay();
}

function toggleSign() {
    if (currentValue === "0" || currentValue === "Error") return;

    currentValue = currentValue.startsWith("-")
        ? currentValue.slice(1)
        : "-" + currentValue;

    updateDisplay();
}

function showError() {
    currentValue = "Error";
    previousValue = null;
    operator = null;
    waitingForOperand = true;
    updateDisplay();
}

function formatNumber(number) {
    if (!Number.isFinite(number)) return "Error";

    const rounded = Number(number.toPrecision(12));

    return String(rounded);
}

function addHistory(expression, result) {
    history.unshift({ expression, result });
    history = history.slice(0, 20);
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No calculations yet.</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-expression">${escapeHtml(item.expression)}</div>
            <div class="history-result">= ${escapeHtml(item.result)}</div>
        </div>
    `).join("");
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.querySelector(".buttons").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
        if (/^\d$/.test(value)) {
            inputNumber(value);
        } else if (value === ".") {
            inputDecimal();
        } else {
            chooseOperator(value);
        }
    }

    if (action === "clear") clearCalculator();
    if (action === "backspace") backspace();
    if (action === "percent") percent();
    if (action === "sign") toggleSign();
    if (action === "equals") equals();
});

document.addEventListener("keydown", (event) => {
    if (/^\d$/.test(event.key)) {
        inputNumber(event.key);
    } else if (event.key === ".") {
        inputDecimal();
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        equals();
    } else if (event.key === "Backspace") {
        backspace();
    } else if (event.key === "Escape") {
        clearCalculator();
    } else if (event.key === "%") {
        percent();
    }
});

clearHistoryButton.addEventListener("click", () => {
    history = [];
    renderHistory();
});

updateDisplay();
renderHistory();
