export async function getExpenses() {
  const response = await fetch(
    "https://script.google.com/macros/s/AKfycbzqWuepu3DuXJijG9yNuZ8p1ZsSCDOofFCuZzrJrnCXnORUCjP43Wok3W5mfo-8WbO5/exec"
  );
  const json = await response.json();
  return json as Expense[];
}
