export function beginInlineTextEdit(
  target: HTMLElement,
  options: { multiline?: boolean; onCommit: (text: string) => void },
) {
  target.contentEditable = "true";
  target.focus();
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(target);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  const commit = () => {
    target.removeEventListener("blur", commit);
    target.removeEventListener("keydown", onKeyDown);
    target.contentEditable = "false";
    options.onCommit((target.textContent ?? "").trim());
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !options.multiline) {
      event.preventDefault();
      target.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      target.blur();
    }
  };

  target.addEventListener("blur", commit);
  target.addEventListener("keydown", onKeyDown);
}
