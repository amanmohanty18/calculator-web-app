'use strict';

let current   = '0';
let previous  = null;
let operator  = null;
let resetNext = false;

const displayEl    = document.getElementById('display');
const expressionEl = document.getElementById('expression');

const opSymbols = { '/': '÷', '*': '×', '-': '−', '+': '+' };

function updateDisplay() {
  displayEl.textContent = current;
  displayEl.classList.toggle('small', current.length > 9);
  displayEl.classList.toggle('error', current === 'Error');

  if (operator && previous !== null) {
    expressionEl.textContent = `${previous} ${opSymbols[operator]}`;
  } else {
    expressionEl.textContent = '';
  }

  // highlight active operator button
  document.querySelectorAll('.btn.operator').forEach(btn => btn.classList.remove('active'));
  if (operator && resetNext) {
    document.querySelectorAll('.btn.operator').forEach(btn => {
      if (btn.getAttribute('aria-label')?.toLowerCase().startsWith(opName(operator))) {
        btn.classList.add('active');
      }
    });
  }
}

function opName(op) {
  return { '/': 'divide', '*': 'multiply', '-': 'subtract', '+': 'add' }[op] || '';
}

function inputDigit(digit) {
  if (current === 'Error') { clearDisplay(); }
  if (resetNext) { current = digit; resetNext = false; }
  else { current = current === '0' ? digit : current + digit; }
  updateDisplay();
}

function inputDecimal() {
  if (current === 'Error') { clearDisplay(); }
  if (resetNext) { current = '0'; resetNext = false; }
  if (!current.includes('.')) current += '.';
  updateDisplay();
}

function inputOperator(op) {
  if (current === 'Error') return;
  if (operator && !resetNext) calculate(true);
  previous  = current;
  operator  = op;
  resetNext = true;
  updateDisplay();
}

function calculate(chained = false) {
  if (!operator || previous === null) return;
  const a = parseFloat(previous);
  const b = parseFloat(current);
  let result;
  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = b !== 0 ? a / b : 'Error'; break;
  }
  if (!chained) expressionEl.textContent = `${previous} ${opSymbols[operator]} ${current} =`;
  current   = result === 'Error' ? 'Error' : String(parseFloat(result.toFixed(10)));
  operator  = null;
  previous  = null;
  resetNext = true;
  displayEl.textContent = current;
  displayEl.classList.toggle('small', current.length > 9);
  displayEl.classList.toggle('error', current === 'Error');
}

function clearDisplay() {
  current = '0'; previous = null; operator = null; resetNext = false;
  updateDisplay();
}

function backspace() {
  if (resetNext || current === 'Error') return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  updateDisplay();
}

function toggleSign() {
  if (current === '0' || current === 'Error') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateDisplay();
}

// ── Keyboard support ──
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9')       inputDigit(e.key);
  else if (e.key === '.')                  inputDecimal();
  else if (e.key === '+')                  inputOperator('+');
  else if (e.key === '-')                  inputOperator('-');
  else if (e.key === '*')                  inputOperator('*');
  else if (e.key === '/')                { e.preventDefault(); inputOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace')          backspace();
  else if (e.key === 'Escape')             clearDisplay();
});
