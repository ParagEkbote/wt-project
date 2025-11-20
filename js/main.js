import { Runner } from "./runner.js";
import { UI } from "./ui.js";

UI.el.button.addEventListener("click", () => Runner.run());
