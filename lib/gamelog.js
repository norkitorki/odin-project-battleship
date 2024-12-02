export const Gamelog = (clazz = '') => {
  const obj = {};
  const container = document.createElement('ul');
  container.classList.value = clazz;

  let messageCount = 0;

  obj.renderLog = (parentElement = document.body) => {
    parentElement.appendChild(container);
  };

  obj.addMessage = (message, numbered = true) => {
    const li = document.createElement('li');
    li.textContent = `${numbered ? `${++messageCount}. ` : ''}${message}`;
    container.prepend(li);
  };

  obj.clear = () => {
    Array.from(container.children).forEach((el) => container.removeChild(el));
    messageCount = 0;
  };

  return obj;
};
