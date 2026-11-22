// Arctic Vault: Frostbite Heist — keyboard and mouse input.
// One job: turn key and pointer events into a plain input object the world
// steps with. No game logic lives here, only bindings.
export function createInput() {
  return {
    up: false, down: false, left: false, right: false,
    clickX: null, clickY: null, clicked: false,
  };
}

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

export function bindInput(input, canvas, hooks) {
  const onKey = (e, pressed) => {
    const field = KEYMAP[e.code];
    if (field) {
      input[field] = pressed;
      e.preventDefault();
      return;
    }
    if (!pressed) return;
    if (e.code === 'Digit1') hooks.onEmp();
    else if (e.code === 'Digit3') hooks.onCloak();
    else if (e.code === 'Digit2') hooks.onSnowballArm();
    else if (e.code === 'Enter') hooks.onEnter();
  };
  window.addEventListener('keydown', (e) => onKey(e, true));
  window.addEventListener('keyup', (e) => onKey(e, false));
  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.clickX = (e.clientX - rect.left) * scaleX;
    input.clickY = (e.clientY - rect.top) * scaleY;
    input.clicked = true;
    hooks.onClick(input.clickX, input.clickY);
  });
  window.addEventListener('blur', () => {
    input.up = false;
    input.down = false;
    input.left = false;
    input.right = false;
  });
}
